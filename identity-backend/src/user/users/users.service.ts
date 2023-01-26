import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { get, pick } from 'lodash';
import { AuthInfo } from 'shared/common/types';
import { asnycMapThrottled } from 'shared/nestjs';
import { RoleUnite } from 'src/keycloak/dto/RoleUnite';
import { UserUnite, UserUniteReadWrite } from 'src/keycloak/dto/UserUnite';
import { In, Repository } from 'typeorm';

import { KeycloakRolesService } from '../../keycloak/keycloak-roles.service';
import { KeycloakUsersService } from '../../keycloak/keycloak-users.service';
import { ActorNameResult } from '../dto/ActorNameResult';
import { UserDto } from '../dto/CreateUser';
import { FreeData } from '../dto/FreeData';
import { UpdateUser } from '../dto/UpdateUser';
import { UpdateableUserProperties, User } from '../dto/User';
import { DeletedActorEntity } from './deleted-actor.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly keycloakUsers: KeycloakUsersService,
    private readonly keycloakRoles: KeycloakRolesService,
    @InjectRepository(DeletedActorEntity)
    private readonly deletedActorRepo: Repository<DeletedActorEntity>,
    @InjectLogger('UsersService')
    private readonly logger: Logger,
  ) {}

  async getAllByTenant(authInfo: AuthInfo): Promise<User[]> {
    const rawUsers = await this.keycloakUsers.getUsersByTenant(authInfo.tenantId);
    return await asnycMapThrottled(this.toUser.bind(this), rawUsers || [], 21);
  }

  async getByIdByTenant(authInfo: AuthInfo, userId: string): Promise<User> {
    const rawUser = await this.keycloakUsers.getUserByIdByTenantId(userId, authInfo.tenantId);
    return this.toUser(rawUser);
  }

  async createForTenant(authInfo: AuthInfo, dto: UpdateUser): Promise<User> {
    const userId = await this.keycloakUsers.createUserForTenant(
      authInfo.tenantId,
      this.toUserUniteReadWrite(dto.user as UserDto),
    );

    // Update roles of the user
    if (dto.user.roles && Array.isArray(dto.user.roles) && dto.user.roles.length > 0) {
      await this.keycloakRoles.updateRolesForUser(
        authInfo.tenantId,
        userId,
        dto.user.roles as RoleUnite[],
      );
    }

    // Update roles of the user
    if (dto.user.roles && Array.isArray(dto.user.roles) && dto.user.roles.length > 0) {
      await this.keycloakRoles.updateRolesForUser(
        authInfo.tenantId,
        userId,
        dto.user.roles as RoleUnite[],
      );
    }

    // Update the password
    if (dto.options.setPassword && dto.options.password) {
      // TODO: FIXME
      await this.keycloakUsers.changePassword(authInfo.tenantId, userId, dto.options.password);
    }

    // Send a password reset mail
    if (dto.options.sendResetPasswordMail) {
      // TODO: FIXME
      await this.keycloakUsers.triggerPasswordResetMail(authInfo.tenantId, userId);
    }

    return this.getByIdByTenant(authInfo, userId);
  }

  async updateByIdForTenant(authInfo: AuthInfo, userId: string, dto: UpdateUser): Promise<User> {
    // Get the user
    const user = await this.getByIdByTenant(authInfo, userId);

    // Update the user
    await this.keycloakUsers.updateUserForTenant(
      authInfo.tenantId,
      userId,
      this.toUserUniteReadWrite({
        ...user,
        ...dto.user,
      }),
    );

    // Update roles of the user
    if (dto.user.roles && Array.isArray(dto.user.roles)) {
      await this.keycloakRoles.updateRolesForUser(
        authInfo.tenantId,
        userId,
        dto.user.roles as RoleUnite[],
      );
    }

    // Update the password
    if (dto.options.setPassword && dto.options.password) {
      // TODO: FIXME
      await this.keycloakUsers.changePassword(authInfo.tenantId, userId, dto.options.password);
    }

    // Send a password reset mail
    if (dto.options.sendResetPasswordMail) {
      // TODO: FIXME
      await this.keycloakUsers.triggerPasswordResetMail(authInfo.tenantId, userId);
    }

    return this.getByIdByTenant(authInfo, userId);
  }

  async deleteByIdForTenant(authInfo: AuthInfo, userId: string): Promise<void> {
    this.logger.debug(`deleteByIdForTenant(${authInfo.tenantId}, ${userId})`);
    const theUser = await this.getByIdByTenant(authInfo, userId);

    if (!theUser) {
      throw new NotFoundException(`No such user`);
    }

    // Actually delete the user
    await this.keycloakUsers.deleteByIdAndTenantId(authInfo.tenantId, userId);

    // But save a record of the deleted user
    const entity = this.deletedActorRepo.create({
      tenantId: authInfo.tenantId,
      refId: userId,
      displayName: [theUser.firstName, theUser.lastName].join(' ').trim() || theUser.name,
      type: 'user',
      createdBy: authInfo.id,
    });

    await this.deletedActorRepo.save(entity);
    this.logger.debug(`Created delete info: ${entity.id}`);
  }

  // TODO: FIXME: remove any
  async getMeInfo(authInfo: AuthInfo): Promise<any> {
    const user = await this.getById(authInfo.id);
    return {
      ...user,
      ...authInfo,
    };
  }

  async getById(userId: string): Promise<User> {
    const user = await this.keycloakUsers.getUserById(userId);
    return await this.toUser(user);
  }

  async updatePartial(userId: string, data: Partial<User>): Promise<User> {
    // Check that the correct update properties are given
    const updateData = pick(data, UpdateableUserProperties);
    if (Object.getOwnPropertyNames(updateData).length < 1) {
      return this.getById(userId); // Nothing to do
    }

    // Perform the actual task of updateing
    const updatedUser = await this.keycloakUsers.updateUserById(userId, updateData);

    // Re-fetch the updated user
    return this.toUser(updatedUser);
  }

  async getFreeDateByUser(authInfo: AuthInfo, filterKey?: string): Promise<Partial<FreeData>> {
    const user = await this.keycloakUsers.getUserById(authInfo.id);
    if (filterKey) {
      return pick(user.freeData || {}, filterKey) as Partial<FreeData>;
    }
    return (user.freeData || {}) as FreeData;
  }

  async updateFreeDateByUser(authInfo: AuthInfo, dto: FreeData): Promise<void> {
    if (!dto) {
      return; // Nothing to do
    }

    const updateKeys = Object.keys(dto);
    if (updateKeys.length < 1) {
      return; // Nothing to do
    }

    // Update the data as requested and merge in the new data
    // into the old data
    // If a new entry has value `null` and exists in the old,
    // remove it
    const user = await this.keycloakUsers.getUserById(authInfo.id);
    const mergedFreeData = user.freeData || {};
    updateKeys.forEach(key => {
      const val = get(dto, key);
      if (val === null && typeof mergedFreeData[key] !== 'undefined') {
        // Delete the entry
        delete mergedFreeData[key];
      } else {
        mergedFreeData[key] = val;
      }
    });

    // Update the data
    await this.keycloakUsers.updateUserById(authInfo.id, {
      freeData: mergedFreeData || {},
    });
  }

  /**
   * Resolves a list of user ids for a given tenant to display names
   * to be displayed e.g. inside the frontend
   *
   * @param authInfo The user information to base this action on
   * @param ids The list of ids to resolve
   * @returns A list of results which always includes all requested ids
   */
  async resolveNamesByUserIds(authInfo: AuthInfo, ids: string[]): Promise<ActorNameResult[]> {
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      throw new BadRequestException(`At least one user id to resolve is required`);
    }

    const users = await this.keycloakUsers.getUsersByIds(ids);
    const tenantIds = [...(authInfo.tenants || []), authInfo.tenantId];
    const usersInTenant = users.filter(u => {
      if (authInfo.isMultiTenantAdmin) {
        return true;
      } else {
        return tenantIds.includes(u.tenantId || '');
      }
    });

    this.logger.debug(
      `resolveNamesByUserIds: ${ids.length} ids in, ${users.length} found, ${usersInTenant.length} after tenanat sep`,
    );

    // Check if there are deleted users
    const deletedObjects = await this.deletedActorRepo.find({
      where: {
        tenantId: authInfo.tenantId,
        refId: In(ids),
      },
    });

    // Mix both together into a big array
    const resolved = [
      ...usersInTenant.map(
        user =>
          ({
            id: user.id,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            type: 'user',
            isDeleted: false,
            isValid: true,
          } as ActorNameResult),
      ),
      ...deletedObjects.map(
        user =>
          ({
            id: user.refId,
            name: user.displayName,
            type: user.type,
            isDeleted: true,
            isValid: true,
          } as ActorNameResult),
      ),
    ];

    // Return the data
    return [
      ...resolved,
      // Add all user id's which could not be resolved
      ...ids
        .filter(p => resolved.findIndex(u => u.id === p) < 0)
        .map(
          id =>
            ({
              id,
              name: `Unknown (${id.substring(0, 5)})`,
              type: 'unknown',
              isDeleted: false,
              isValid: false,
            } as ActorNameResult),
        ),
    ];
  }

  async userNameAvailable(authInfo: AuthInfo, name: string): Promise<boolean> {
    const usersInTenant = await this.keycloakUsers.getUsersByTenantAndName(
      authInfo.tenantId,
      name || '',
    );
    return usersInTenant.length > 0;
  }

  // ---

  private toUserUniteReadWrite(data: User): UserUniteReadWrite {
    return {
      name: data.name,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      imageId: data.imageId || null,
      preferredLanguage: data.preferredLanguage,
      // TODO: FIXME remove
      activated: true,
    };
  }

  private async toUser(keyCloakUser: UserUnite): Promise<User> {
    return {
      id: keyCloakUser.id,
      name: keyCloakUser.name,
      email: keyCloakUser.email,
      firstName: keyCloakUser.firstName || null,
      lastName: keyCloakUser.lastName || null,
      imageId: keyCloakUser.imageId || null,
      tenantId: keyCloakUser.tenantId,
      preferredLanguage: keyCloakUser.preferredLanguage || null,
      roles: keyCloakUser.roles,
    };
  }
}
