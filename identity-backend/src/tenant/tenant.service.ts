import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { pick } from 'lodash';
import { AuthInfo } from 'shared/common/types';
import { TenantUnite } from 'src/keycloak/dto/TenantUnite';
import { Connection, In, Repository } from 'typeorm';

import { KeycloakTenantsService } from '../keycloak/keycloak-tenants.service';
import { TenantSettingsService } from '../tenant-settings/tenant-settings.service';
import { CreateTenantClassDto } from './dto/CreateTenantDto';
import { UpdateTenantClassDto } from './dto/UpdateTenantDto';
import { TenantEntity } from './tenant.entity';

@Injectable()
export class TenantService {
  constructor(
    private readonly keycloakTenants: KeycloakTenantsService,
    private readonly tenantSettingsService: TenantSettingsService,
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
    @InjectConnection()
    private readonly connection: Connection,
    @InjectLogger(`TenantService`)
    private readonly logger: Logger,
  ) {}

  /**
   * Returns a list of all tenants available to the current user to
   * let the user change tenants.
   * For tenant admins this function returns a list of all tenants
   * available in the system
   *
   * @param authInfo The user session to filter the result
   * @returns An array of `TenantEntity` objects at least zero
   */
  async findAll(authInfo: AuthInfo): Promise<TenantEntity[]> {
    const ids = await this.getTenantIdsForUser(authInfo);
    if (ids.length < 1) {
      // Nothing to report, sorry!
      return [];
    }

    // Find all entites from the database
    const entites = await this.tenantRepo.find({ id: In(ids) });
    this.logger.debug(`findAll({..., id: ${authInfo.id}}): ${entites.length} tenants found`);
    return entites || [];
  }

  /**
   * Finds a tenant by its UUID but only if the user is a member of
   * this tenant or a "tenant admin".
   * Otherwise it throws a `NotFoundException`.
   *
   * @param authInfo The user session to filter the result
   * @param id The id of the tenant to find
   * @returns The tenant object or an exception is thrown
   */
  async getById(authInfo: AuthInfo, id: string): Promise<TenantEntity> {
    await this.ensureCurrentUserOfTenant(authInfo, id);

    const tenant = await this.tenantRepo.findOne({ where: { id }, relations: ['tenantSettings'] });
    if (!tenant) {
      throw new NotFoundException(`No such tenant`);
    }

    return tenant;
  }

  /**
   * Creates a new tenant with the current user as the first member
   *
   * @param authInfo The user session to filter the result
   * @param dto The tenant create data model
   * @returns The created tenant
   */
  async create(authInfo: AuthInfo, dto: CreateTenantClassDto): Promise<TenantEntity> {
    const tenantId = await this.connection.transaction(async em => {
      const repo = em.getRepository(TenantEntity);

      // Create the new tenant inside the database first
      const newEnt = repo.create({
        ownerId: dto.ownerId || authInfo.id,
        name: dto.name,
        description: dto.description || null,
        enabled: dto.enabled || true,
        createdBy: authInfo.id,
      });

      await repo.save(newEnt, { reload: true });
      this.logger.debug(`create(): tenantId=${newEnt.id}`);

      // Then trigger Keycloak to create it
      await this.keycloakTenants.create(newEnt.id);

      // Add the current user to the newly created tenant
      await this.keycloakTenants.addUserToTenantByIdByUserId(newEnt.id, authInfo.id);

      // If the operation fails at the database level or Keycloak
      // cannot create the tenant nothing happens since everything
      // runs inside a transaction
      return newEnt;
    });

    await this.tenantSettingsService.createDefaultSettings(tenantId.id);

    return tenantId;
  }

  /**
   * Updates the properties of a tenant but only if the requesting user
   * is part of the tenant or a "tenant admin"
   *
   * @param authInfo The user session to filter the result
   * @param id
   * @param dto
   * @returns
   */
  async update(
    authInfo: AuthInfo,
    id: string,
    dto: Partial<UpdateTenantClassDto>,
  ): Promise<TenantEntity> {
    await this.ensureCurrentUserOfTenant(authInfo, id);

    const tenant = await this.getById(authInfo, id);
    const kkTenant = await this.keycloakTenants.byTenantId(tenant.id);

    if (!kkTenant) {
      this.logger.error(`Tenant ${id} exists inside the database but not in Keycloak!`);
      throw new NotFoundException(`Cannot find the tenant`);
    }

    // Assign the data and update the entity
    Object.assign(tenant, pick(dto, ['name', 'description', 'enabled', 'ownerId']));
    await this.tenantRepo.save(tenant, { reload: true });

    this.logger.debug(`update(..., ${id}, ...): entity updated`);
    return tenant;
  }

  /**
   * Remove the tenant identified by `id` from Keycloak and
   * from the database as-well but only if the requesting user
   * is part of the tenant or a "tenant admin"
   *
   * @param authInfo The user session to filter the result
   * @param id The id of the tenant to remove
   */
  async remove(authInfo: AuthInfo, id: string) {
    await this.ensureCurrentUserOfTenant(authInfo, id);

    await this.connection.transaction(async em => {
      // Delete the tenant from the db
      const repo = em.getRepository(TenantEntity);
      await repo.delete({ id });

      // Delete the tenant from keycloak
      const keycloakTenant = await this.keycloakTenants.byTenantId(id);

      if (!keycloakTenant) {
        this.logger.error(`Tenant ${id} cannot be deleted: not found in Keycloak!`);
        throw new BadRequestException(`Tenant already deleted, cannot delete`);
      }

      // Remove the Keycloak tenant
      await this.keycloakTenants.removeById(keycloakTenant.keycloakId);
    });
  }

  /**
   * Checks if the user identified by `authInfo` is in the tenant identified
   * by `tenantId`. This function will never throw an exception
   *
   * @param authInfo The user to check
   * @param tenantId To check if the user is in this tenant
   */
  async isUserInTenant(authInfo: AuthInfo, tenantId: string): Promise<boolean> {
    try {
      return this.isCurrentUserOfTenant(authInfo, tenantId);
    } catch (ex) {
      this.logger.error(`Cannot isUserInTenant (tenantId=${tenantId}, user=${authInfo.id}): ${ex}`);
      return false;
    }
  }

  // ---

  /**
   * Ensures that the user is part of the tenant or a "tenant admin". See
   * function `TenantService#isCurrentUserOfTenant()`. Throws an exeption
   * with an HTTP save message intended to be directly transmitted to the
   * user
   *
   * @param authInfo The user session to filter the result
   * @param tenantId The tenant id to check the user against
   */
  private async ensureCurrentUserOfTenant(authInfo: AuthInfo, tenantId: string): Promise<void> {
    const is = await this.isCurrentUserOfTenant(authInfo, tenantId);
    if (!is) {
      throw new ForbiddenException(`Users might not delte foreign tenants`);
    }
  }

  /**
   * Checks if the provided user is part of the tenant (or "tenant admin") identifed
   * by the tenant id and returns a boolean value to indicate the result
   *
   * @param authInfo The user session to filter the result
   * @param tenantId The tenant id to check the user against
   * @returns Either `true` = user is part of the tenant or `false` is not
   */
  private async isCurrentUserOfTenant(authInfo: AuthInfo, tenantId: string): Promise<boolean> {
    if (authInfo.isMultiTenantAdmin) {
      return true;
    }
    const userTenants = await this.getTenantIdsForUser(authInfo);
    return userTenants.includes(tenantId);
  }

  /**
   * Fetches a list of all tenant ids to which the provided user
   * has acces. If the user is a "tenant admin" the list of all
   * existing tenants is returned
   *
   * @param authInfo The user session to filter the result
   * @returns A list of tenant ids with at least 0 elements
   */
  private async getTenantIdsForUser(authInfo: AuthInfo): Promise<string[]> {
    let tenants: TenantUnite[] = [];
    if (authInfo.isMultiTenantAdmin) {
      tenants = await this.keycloakTenants.findTenants();
    } else {
      tenants = await this.keycloakTenants.findTenantsForUser(authInfo.id);
    }
    return tenants.map(t => t.tenantId);
  }
}
