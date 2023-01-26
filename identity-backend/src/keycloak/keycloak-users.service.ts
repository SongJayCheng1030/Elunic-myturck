import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { RequiredActionAlias } from '@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import { Injectable, NotFoundException } from '@nestjs/common';
import { get } from 'lodash';
import { asnycMapThrottled } from 'shared/nestjs';

import { FreeData } from '../user/dto/FreeData';
import { UserUnite, UserUniteReadWrite } from './dto/UserUnite';
import { KeycloakRolesService } from './keycloak-roles.service';
import { KeycloakRpcService } from './keycloak-rpc.service';
import { KeycloakTenantsService } from './keycloak-tenants.service';

/**
 * The request block size for pagination
 */
const USERS_ASYNC_BATCH_SIZE = 21;

/**
 * This service handles all user management performed from
 * Shofloor to Keycloak.
 */
@Injectable()
export class KeycloakUsersService {
  constructor(
    private readonly keycloakTenantsService: KeycloakTenantsService,
    private readonly keycloakRpc: KeycloakRpcService,
    private readonly keycloakRolesService: KeycloakRolesService,
    @InjectLogger(`KeycloakUsersService`)
    private readonly logger: Logger,
  ) {}

  /**
   * List all users in a specified tenant
   *
   * @param tenantId The id of the tenant to list users for (must
   * exist)
   * @returns An array of users or an empty array. Throws only an
   * exception for non-existing tenantIds
   */
  async getUsersByTenant(tenantId: string): Promise<UserUnite[]> {
    this.logger.debug(`getUsersByTenant(${tenantId})`);

    // First get the tenant
    const tenant = await this.keycloakTenantsService.byTenantId(tenantId);
    if (!tenant) {
      throw new NotFoundException(`No such tenant found`);
    }

    const kkUsers = await this.keycloakRpc.wrapCall(client => {
      return client.groups.listMembers({ id: tenant.keycloakId });
    });
    this.logger.debug(`getUsersByTenant(${tenantId}): found ${kkUsers.length} users`);

    return await asnycMapThrottled(
      this.toUserUnite.bind(this),
      kkUsers || [],
      USERS_ASYNC_BATCH_SIZE,
    );
  }

  /**
   * Returns the `UserUnite` objects for a given list of user ids
   *
   * @param tenantId The id of the tenant to get the users from
   * @param userIds An array of user ids to get `UserUnite` objects for
   * @returns
   */
  async getUsersByTenantByIds(tenantId: string, userIds: string[]): Promise<UserUnite[]> {
    this.logger.debug(`getUsersByTenant(${tenantId}, userIds) userIds=`, userIds);

    if (!Array.isArray(userIds) || userIds.length < 1) {
      return []; // Nothing to do
    }

    // First get the tenant
    const tenant = await this.keycloakTenantsService.byTenantId(tenantId);
    if (!tenant) {
      throw new NotFoundException(`No such tenant found`);
    }

    const kkUsers = await this.keycloakRpc.wrapCall(client => {
      return client.groups.listMembers({ id: tenant.keycloakId });
    });

    const reducedKkUsersById = (kkUsers || []).filter(
      u => u.id && u.id.length === 36 && userIds.includes(u.id || ''),
    );
    this.logger.debug(`getUsersByTenant(...): found ${reducedKkUsersById.length} users`);
    return await asnycMapThrottled(
      this.toUserUnite.bind(this),
      reducedKkUsersById,
      USERS_ASYNC_BATCH_SIZE,
    );
  }

  /**
   * Finds users by id
   *
   * @param userIds A list of user ids to find users for
   * @returns An array of UserUnite objects or an empty array
   */
  async getUsersByIds(userIds: string[]): Promise<UserUnite[]> {
    this.logger.debug(`getUsersByIds(${userIds.join(', ')})`);

    if (!Array.isArray(userIds) || userIds.length < 1) {
      return []; // Nothing to do
    }

    // TODO: this way it is somewhat ineficcient but at the time of
    // writing there is no other way to do it
    const collector: UserRepresentation[] = [];
    for (const userId of userIds) {
      try {
        const kkUser = await this.keycloakRpc.wrapCall(client => {
          return client.users.findOne({ id: userId });
        });
        if (kkUser) {
          collector.push(kkUser);
        }
      } catch (_) {
        // Ignore
      }
    }

    const reducedKkUsersById = collector.filter(
      u => u.id && u.id.length === 36 && userIds.includes(u.id || ''),
    );
    this.logger.debug(`getUsersByIds(...): found ${reducedKkUsersById.length} users`);
    return await asnycMapThrottled(
      this.toUserUnite.bind(this),
      reducedKkUsersById,
      USERS_ASYNC_BATCH_SIZE,
    );
  }

  /**
   * Tries to find all users for a given username (might be multiple)
   *
   * @param tenantId The id of the tenant to get the users from
   * @param username The name of the user or partial
   * @returns
   */
  async getUsersByTenantAndName(tenantId: string, username: string): Promise<UserUnite[]> {
    this.logger.debug(`getUsersByTenantAndName(${tenantId}, ${username})`);

    const tenant = await this.keycloakTenantsService.byTenantId(tenantId);
    if (!tenant) {
      throw new NotFoundException(`No such tenant found`);
    }

    const kkUsers = await this.keycloakRpc.wrapCall(client => {
      return client.users.find({ username });
    });

    const ret = await asnycMapThrottled(
      this.toUserUnite.bind(this),
      kkUsers,
      USERS_ASYNC_BATCH_SIZE,
    );
    this.logger.debug(
      `getUsersByTenantAndName(${tenantId}, ${username}): found ${(ret || []).length}`,
    );

    // Make sure to only return users from the current tenant
    return ret.filter(u => u.tenantId === tenantId);
  }

  /**
   * Finds a user
   *
   * @param id The id of the user to find
   * @param tenantId The tenant id of the user
   * @returns The `UserUnite` if found otherwise an exception is thrown
   */
  async getUserByIdByTenantId(id: string, tenantId: string): Promise<UserUnite> {
    this.logger.debug(`getUserByIdByTenantId(${id}, ${tenantId})`);

    const allUsers = await this.getUsersByTenant(tenantId);
    const u = allUsers.find(p => p.id === id);

    if (!u) {
      throw new NotFoundException(`No such user`);
    }

    return u;
  }

  /**
   * Finds a user
   *
   * @param id The id of the user to find
   * @returns The `UserUnite` if found otherwise an exception is thrown
   */
  async getUserById(id: string): Promise<UserUnite> {
    this.logger.debug(`getUserByIdByTenantId(${id})`);

    const theUser = await this.keycloakRpc.wrapCall(client => {
      return client.users.findOne({ id });
    });

    if (!theUser) {
      throw new NotFoundException('No such user');
    }

    return this.toUserUnite(theUser);
  }

  /**
   * Updates a user by a given id. See `updateUserForTenant()` for a safer
   * way to update a user
   *
   * @param id The id of the user to update
   * @param data The update data
   * @returns Returns the update user object or throws an exception
   */
  async updateUserById(id: string, data: Partial<UserUnite>): Promise<UserUnite> {
    this.logger.debug(`updateUserById(${id}, ...): data=`, data);
    const user = await this.getUserById(id);

    await this.keycloakRpc.wrapCall(async client => {
      return await client.users.update(
        { id },
        await this.fromUserUnite({
          ...user,
          ...data,
        }),
      );
    });

    return this.getUserById(id);
  }

  /**
   * Updates a user by a given id
   *
   * @param tenantId The id of the tenant in which the user exists
   * @param userId The id of the user to update
   * @param data The update data
   * @returns Returns the update user object or throws an exception
   */
  async updateUserForTenant(
    tenantId: string,
    userId: string,
    dto: UserUniteReadWrite,
  ): Promise<UserUnite> {
    this.logger.debug(`updateUserForTenant(${tenantId}, ${userId}, ...)`);

    // Find the user
    const user = await this.getUserByIdByTenantId(userId, tenantId);

    // Transform to KK object
    const kkUser = await this.fromUserUnite({
      ...user,
      ...dto,
      // Ensure this stays the same
      tenantId: user.tenantId,
    });

    // Update
    await this.keycloakRpc.wrapCall(client => client.users.update({ id: userId }, kkUser));

    return this.getUserById(userId);
  }

  /**
   * Creates a new user inside a tenant
   *
   * @param tenantId The id of the tenant in which the user should be created in
   * @param user The data of the new user
   * @returns The id of the newly created user
   */
  async createUserForTenant(tenantId: string, user: UserUniteReadWrite): Promise<string> {
    this.logger.debug(`createUserForTenant(${tenantId}, ...): user=`, user);

    const kkUser = await this.fromUserUnite({ ...user, tenantId });

    // Create the user
    const newUser = await this.keycloakRpc.wrapCall(client =>
      client.users.create({ ...kkUser, enabled: true }),
    );

    // Add to the current tenant
    await this.keycloakTenantsService.addUserToTenantByIdByUserId(tenantId, newUser.id);

    this.logger.debug(`createUserForTenant(${tenantId}, ...): created with id #${newUser.id}`);
    return newUser.id;
  }

  /**
   * Deletes an existing user by id from a tenant
   *
   * @param tenantId The id of the tenant to delete the user from
   * @param userId The id of the user to delete
   */
  async deleteByIdAndTenantId(tenantId: string, userId: string): Promise<void> {
    const user = await this.getUserByIdByTenantId(userId, tenantId);
    this.logger.debug(`deleteByIdAndTenantId(${tenantId}, ${userId}): found user: ${user.name}`);

    await this.keycloakRpc.wrapCall(client => client.users.del({ id: user.id }));
  }

  /**
   * Updates the password for a given user
   *
   * @param tenantId The id of the tenant to update the user in
   * @param userId The id of the user to update the password for
   * @param newPassword The new password for the user
   */
  async changePassword(tenantId: string, userId: string, newPassword: string): Promise<void> {
    this.logger.debug(`changePassword(${tenantId}, ${userId}, *****)`);

    const user = await this.getUserByIdByTenantId(userId, tenantId);

    await this.keycloakRpc.wrapCall(client =>
      client.users.resetPassword({
        id: user.id,
        credential: {
          temporary: false,
          type: 'password',
          value: newPassword,
        },
      }),
    );
  }

  /**
   * Triggers a password reset mail for the given user
   *
   * @param tenantId The id of the tenant where the user lives in
   * @param userId The id of the user to trigger the password reset mail for
   */
  async triggerPasswordResetMail(tenantId: string, userId: string): Promise<void> {
    this.logger.debug(`triggerPasswordResetMail(${tenantId}, ${userId})`);

    const user = await this.getUserByIdByTenantId(userId, tenantId);

    await this.keycloakRpc.wrapCall(client =>
      client.users.executeActionsEmail({
        id: user.id,
        actions: [RequiredActionAlias.UPDATE_PASSWORD],
      }),
    );
  }

  // ---

  /**
   * Transforms a Keycloak `UserRepresentation` object into an internal
   * `UserUnite` object and adds further data to it
   *
   * @param keycloakUser The Keycloak `UserRepresentation` object
   * @returns The augmented `UserUnite` object
   */
  private async toUserUnite(keycloakUser: UserRepresentation): Promise<UserUnite> {
    // Find the roles for the user
    const roles = await this.keycloakRolesService.getAllRolesByUserId(keycloakUser.id || '');

    const attributes = keycloakUser.attributes || {};

    // Get the free data
    const freeData: FreeData = {};
    for (const key in attributes) {
      if (key.startsWith('freeData.')) {
        const val = attributes[key]?.length > 0 ? attributes[key][0] : null;
        const pureKey = key.substring(9);
        if (val && pureKey) {
          freeData[pureKey] = JSON.parse(val);
        }
      }
    }

    const user: UserUnite = {
      id: keycloakUser.id as string,
      firstName: keycloakUser.firstName as string,
      lastName: keycloakUser.lastName as string,
      name: keycloakUser.username as string,
      email: keycloakUser.email as string,
      activated: true,
      tenantId: this.keycloakRpc.getAttOrDef<string | null>(keycloakUser, 'home_tenant_id', null),
      preferredLanguage: this.keycloakRpc.getAttOrDef<string | null>(
        keycloakUser,
        'preferredLanguage',
        'de_DE',
      ),
      freeData,
      imageId: this.keycloakRpc.getAttOrDef<string | null>(keycloakUser, 'image_file_id', null),
      roles: roles.map(r => ({
        id: r.id,
        key: r.key,
        isDefault: r.isDefault,
        name: r.name,
      })),
    };

    return user;
  }

  /**
   * Transforms an internal `UserUnite` object into a Keycloak
   * `UserRepresentation` object to use in conjunction with the Keycloak API
   *
   * @param user The `UserUnite` object
   * @returns The Keycloak `UserRepresentation` object
   */
  private async fromUserUnite(user: UserUnite | UserUniteReadWrite): Promise<UserRepresentation> {
    const { firstName, lastName, name, email, preferredLanguage } = user;

    const freeDataAttrs: { [key: string]: (string | number | boolean)[] } = {};

    if ('freeData' in user) {
      for (const key in user.freeData || {}) {
        const val = get(user.freeData || {}, key);
        if (val) {
          // Keycloak handles only strings
          freeDataAttrs[`freeData.${key}`] = [JSON.stringify(val, null, 0)];
        }
      }
    }

    const dto: UserRepresentation = {
      firstName: firstName as string,
      lastName: lastName as string,
      username: name as string,
      email,
      attributes: {
        preferredLanguage: [preferredLanguage || 'de_DE'],
        ...('tenantId' in user && user.tenantId ? { ['home_tenant_id']: [user.tenantId] } : {}),
        ...freeDataAttrs,
        ...(user.imageId ? { ['image_file_id']: [user.imageId] } : {}),
      },
    };

    return dto;
  }
}
