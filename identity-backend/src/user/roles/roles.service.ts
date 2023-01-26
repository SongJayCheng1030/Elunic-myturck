import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { omit, pick } from 'lodash';
import { AuthInfo } from 'shared/common/types';

import { RightUnite, RoleUnite } from '../../keycloak/dto/RoleUnite';
import { KeycloakRolesService } from '../../keycloak/keycloak-roles.service';
import { KeycloakTenantsService } from '../../keycloak/keycloak-tenants.service';
import { KeycloakUsersService } from '../../keycloak/keycloak-users.service';
import { CreateRoleDto, Right, Role, ShortRole, UpdateRoleDto } from '../dto/Role';
import { RoleMigrations } from './migrations';

/**
 * Nomenclature: the Shopfloor.io application currently only supports
 * "rights" with have a defined key, are assigned to a user and a route.
 *
 * If a route has a rights key assigned and the current requesting user
 * (`AuthInfo`) has the required right the user gets access. Otherwise
 * the request is denied.
 *
 * The concept of roles is in the context of Shopfloor.io only a mean
 * to group multiple rights into a "collection" to assign this collection
 * to a user instead of selecting every right for the user.
 *
 * See the docs for further details on this topic.
 */
@Injectable()
export class RolesService {
  constructor(
    private readonly keycloakRoles: KeycloakRolesService,
    private readonly keycloakUsers: KeycloakUsersService,
    private readonly keycloakTenants: KeycloakTenantsService,
    @InjectLogger('RolesService')
    private readonly logger: Logger,
  ) {}

  /**
   * Initialize roles and create the default roles in Keycloak if
   * they not yet exist
   */
  async init() {
    this.logger.debug(`Initializing service ...`);

    // Migrate
    for (const migr of RoleMigrations) {
      this.logger.debug(`Executing migration ...`);
      await migr(this.logger, this.keycloakRoles, this.keycloakUsers, this.keycloakTenants);
    }
  }

  /**
   * Returns a list of all available rights inside the application
   * which can be used and composed into roles. The docs for further
   * details
   *
   * @returns A list of all roles
   */
  async findAllRights(): Promise<Right[]> {
    const rights = await this.keycloakRoles.getAllRights();
    return (rights || []).map(this.toRight.bind(this));
  }

  /**
   * Find all roles available in the system for the current user
   * or tenant
   *
   * @param authInfo The current user including the tenant id to operate on
   * @returns All roles for the current tenant including the default
   * Shopfloor.io roles and the custom created roles
   */
  async findAll(authInfo: AuthInfo): Promise<ShortRole[]> {
    // Find all roles
    const roles = await this.keycloakRoles.getAllRoles(authInfo.tenantId);

    // Combine & transform
    const rolesTransformed = roles.map(this.toShortRole.bind(this));
    this.logger.debug(`findAll(${authInfo.tenantId}): len(roles)=${rolesTransformed.length}`);

    return rolesTransformed || [];
  }

  /**
   * Creates a new group containing a list of selected rights
   *
   * @param authInfo The current user including the tenant id to operate on
   * @param dto The data for role creation
   * @returns The created role
   */
  async createForTenant(authInfo: AuthInfo, dto: CreateRoleDto): Promise<Role> {
    this.logger.debug(`createForTenant(${authInfo.id}, ...): `, dto);
    const newRole = await this.keycloakRoles.createRoleForTenant(
      authInfo.tenantId,
      pick(dto, ['name', 'description', 'rights']),
    );
    return this.toRole(newRole);
  }

  /**
   * Updates an existing role
   *
   * @param authInfo The current user including the tenant id to operate on
   * @param roleId The id of the role to update
   * @param dto The update data
   * @returns The updated role
   */
  async updateForTenant(authInfo: AuthInfo, roleId: string, dto: UpdateRoleDto): Promise<Role> {
    this.logger.debug(`updateForTenant(${authInfo.id}, ${roleId}, ...): `, dto);
    const rawRole = await this.keycloakRoles.updateByTenantId(
      authInfo.tenantId,
      roleId,
      pick(dto, ['name', 'description', 'rights']),
    );
    return this.toRole(rawRole);
  }

  /**
   * Tries to find a role by a given `id` inside the
   *
   * @param authInfo The current user including the tenant id to operate on
   * @param roleId The id of the role to find
   * @returns Either the role, if found, otherwise a `NotFoundException` is
   * thrown which can be directly forwareded to the user (no sensitive data)
   */
  async findById(authInfo: AuthInfo, roleId: string): Promise<Role> {
    this.logger.debug(`findById(${authInfo.id}, ${roleId})`);
    const role = await this.keycloakRoles.findByIdAndTenantId(authInfo.tenantId, roleId);
    if (!role) {
      throw new NotFoundException(`The role could not be found`);
    }
    return this.toRole(role);
  }

  /**
   * Deletes a given role and unassigns the role from all users which currently
   * use this role. Throws an exception on error or succeeds otherwise
   *
   * @param authInfo The current user including the tenant id to operate on
   * @param roleId The role to delete
   */
  async deleteById(authInfo: AuthInfo, roleId: string): Promise<void> {
    await this.keycloakRoles.deleteByIdAndTenantId(authInfo.tenantId, roleId);
  }

  // ---

  /**
   * Transforms an internal role representation to an external representation
   * in a short form (i.e. not including a rights list)
   *
   * @param dto Internal role representation from Keycloak connector
   * @returns The external role, with mostly removed internal properties
   */
  private toShortRole(dto: RoleUnite): ShortRole {
    return omit(dto, ['keycloakId', 'rights']) as ShortRole;
  }

  /**
   * Transforms an internal role representation to an external representation
   * (full data)
   *
   * @param dto Internal role representation from Keycloak connector
   * @returns The external role, with mostly removed internal properties
   */
  private toRole(dto: RoleUnite): Role {
    const role = omit(dto, ['keycloakId', 'rights']) as Role;
    role.rights = dto.rights.map(this.toRight.bind(this));
    return role;
  }

  /**
   * Transforms an internal right representation to an external representation
   *
   * @param dto Internal right representation from Keycloak connector
   * @returns The external right, with mostly removed internal properties
   */
  private toRight(dto: RightUnite): Right {
    return omit(dto, 'keycloakId') as Right;
  }
}
