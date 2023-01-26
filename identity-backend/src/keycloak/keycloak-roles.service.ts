import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { has, isEqual, sortBy, uniq } from 'lodash';
import * as NodeCache from 'node-cache';
import { MultilangValue } from 'shared/common/models';
import {
  asnycMapThrottled,
  mapRightKeyToUUID,
  RightDescriptions,
  ShopfloorIoRightPrefix,
  SioRights,
  strconv,
  UnknownRightDescription,
} from 'shared/nestjs';
import {
  getShopfloorIoTenantRolePrefix,
  ShopfloorIoCustomRolePrefix,
  ShopfloorIoRolePrefix,
  UnknownRoleName,
} from 'shared/nestjs/roles/roles';

import { RightUnite, RoleUnite } from './dto/RoleUnite';
import { KeycloakRpcService } from './keycloak-rpc.service';

/**
 * Internal cache key for caching rights list
 */
const CACHEKEY_ALL_RIGHTS = `ALL_RIGHTS`;

/**
 * Internal cache key for roles list
 */
const CACHEKEY_ROLES = `ROLES_PREFIX_`;

/**
 * Internal cache key for all roles cache
 */
const CACHEKEY_ALL_ROLES = `ALL_ROLES_PREFIX_`;

/**
 * Internal cache key for right cache
 */
const CACHEKEY_RIGHTS_FOR_ROLE = `RIGHTS_FOR_ROLE_`;

/**
 * The request block size for pagination
 */
const ROLE_PROCESSING_BLOCK_SIZE = 21;

/**
 * This service manages (`KeycloakRolesService`) all aspects of Shopfloor
 * roles with Keycloak. The Keycloak roles facility is used to model the
 * Shopfloor rights (and roles). The primary concept of Shopfloor is:
 *
 *  - rights: API endpoints require certain rights to be accessed
 *  - roles: a collection of rights, in the scope of Shopfloor only a
 *    usability function to combine multiple rights together to simplify
 *    assignment. There is no special functionality behind it
 */
@Injectable()
export class KeycloakRolesService {
  private cache: NodeCache;

  constructor(
    private readonly keycloakRpc: KeycloakRpcService,
    @InjectLogger(`KeycloakRolesService`)
    private readonly logger: Logger,
  ) {
    this.cache = new NodeCache({ stdTTL: 60 });
  }

  /**
   * Initializes this roles service and performs initial
   * migrations like creating the Shopfloor rights structure
   */
  async init() {
    // Compute what needs to be created
    const existingKeys = ((await this.getAllRights()) || []).map(r => r.key);
    const toCreate = Object.values(SioRights).filter(key => existingKeys.indexOf(key) < 0);

    // Check if need to perform any action
    if (toCreate.length < 1) {
      this.logger.info(`Shopfloor rights in Keycloak are up-to-date. Nothing to change.`);
      return;
    }

    // Create the difference
    this.logger.info(`${toCreate.length} rights to create`);
    for (const right of toCreate) {
      this.logger.debug(`Creating right '${right}' ...`);

      await this.keycloakRpc.wrapCall(client =>
        client.roles.create({
          name: right,
          composite: false,
          attributes: {
            ...this.keycloakRpc.marshallAttr('createdAt', new Date().toISOString()),
            ...this.keycloakRpc.marshallAttr('updatedAt', new Date().toISOString()),
          },
        }),
      );
    }

    this.logger.info(`Creation finished.`);
  }

  /**
   * Lists all rights available (not diveded any deeper)
   * to the system. These are not user-editable
   *
   * @returns A list of rights.
   */
  async getAllRights(): Promise<RightUnite[]> {
    let data = this.cache.get<RightUnite[]>(CACHEKEY_ALL_RIGHTS);

    if (!data) {
      data = await this.listAllRights();
      this.logger.debug(`getAllRights(): loaded ${data.length} rights from KK`);
      this.cache.set(CACHEKEY_ALL_RIGHTS, data);
    } else {
      this.logger.debug(`getAllRights(): ${data.length} rights from CACHE`);
    }

    return data || [];
  }

  /**
   * List all roles (= collection of rights) for a given user
   *
   * @param userId The id of the user to list the assigned roles for
   * @returns An array of roles or an empty array
   */
  async getAllRolesByUserId(userId: string): Promise<RoleUnite[]> {
    this.logger.debug(`getAllRolesByUserId(${userId})`);

    const info = await this.keycloakRpc.wrapCall(client =>
      client.users.listRoleMappings({ id: userId }),
    );
    this.logger.debug(`found:`, info.realmMappings);

    const roles = (info.realmMappings || []).filter(
      p =>
        (p.name || '').startsWith(ShopfloorIoRolePrefix) ||
        (p.name || '').startsWith(ShopfloorIoCustomRolePrefix),
    );

    // Transform the found roles into a RoleUnite object
    const ret = [];
    for (const role of roles) {
      if (role.id) {
        ret.push(await this.findByKeycloakId(role.id));
      }
    }
    this.logger.debug(`result:`, ret);
    return ret;
  }

  /**
   * Get all roles for a specific tenant or all roles in the entire
   * system
   *
   * @param tenantId The id of the tenant to get the roles for or `null`
   * if "really" all roles should be fetched
   * @returns An array of roles or an empty array
   */
  async getAllRoles(tenantId: string | null): Promise<RoleUnite[]> {
    const key = `${CACHEKEY_ALL_ROLES}_${tenantId || 'NULL'}`.toUpperCase();
    this.logger.debug(`getAllRoles(): tenantId=${tenantId}, key=${key}`);

    const exists = this.cache.get<RoleUnite[]>(key);
    if (exists) {
      this.logger.debug(`getAllRoles(): CACHE HIT`);
      return exists;
    } else {
      this.logger.debug(`getAllRoles(): CACHE MISS`);
    }

    const roles = await this.getAllRolesUncached(tenantId);
    this.cache.set(key, roles);
    return roles;
  }

  /**
   * Get a role by it's key or name, e.g. `urn:sio:role:foobar-role`, independent
   * from tenants
   *
   * @param key The key of the role to get
   * @returns Either the role or `null` if not found
   */
  async getRoleByKey(key: string): Promise<RoleUnite | null> {
    const roles = await this.getAllRoles(null);
    return roles.find(p => p.key === key) || null;
  }

  /**
   * Creates a new role for a given tenant
   *
   * @param tenantId The id of the tenant to create the new role in
   * @param role The role data for the role to create
   * @returns The newly created role
   */
  async createRoleForTenant(tenantId: string, role: Partial<RoleUnite>): Promise<RoleUnite> {
    const roleName = getShopfloorIoTenantRolePrefix(
      tenantId,
      `custom/${Math.random().toString(32).substring(2)}`,
    );

    const createdRole = await this.createRole({
      ...role,
      key: roleName,
    });

    await this.onInvalidateRolesCacheForTenant(tenantId);

    return createdRole;
  }

  /**
   * Actual function to create a role inside keycloak, only to be used internally.
   * Otherwise use `createRoleForTenant`!
   *
   * @param role The role object to create
   * @returns The created role
   */
  async createRole(role: Partial<RoleUnite>): Promise<RoleUnite> {
    this.logger.debug(`createRole(...):`, role);

    const rawRoleId = await this.keycloakRpc.wrapCall(async client => {
      // Create the new role
      const newRoleName = await client.roles.create({
        name: role.key,
        description: strconv.ParseMultiLangToString(role.name, 'en-EN'),
        composite: true,
        attributes: {
          ...this.keycloakRpc.marshallJsonAttr('name', role.name),
          ...this.keycloakRpc.marshallJsonAttr('description', role.description || {}),
          ...this.keycloakRpc.marshallAttr('createdAt', new Date().toISOString()),
          ...this.keycloakRpc.marshallAttr('updatedAt', new Date().toISOString()),
        },
      });
      this.logger.debug(`createRole(...): newRoleName=${newRoleName}`);

      // Get the created role
      const newRole = await client.roles.findOneByName({ name: role.key || '' });

      if (!newRole || !newRole.id) {
        throw new Error(`Create role failed: could not read role after create, key=${role.key}`);
      }
      const id = newRole.id;

      // Assign the rights to the role
      const allRights = await this.getAllRights();
      let selectedRights: { composite: boolean; id: string }[] = [];
      if (role.rights && Array.isArray(role.rights)) {
        const rs = role.rights;
        selectedRights = allRights
          .filter(p => rs.findIndex(k => k.id === p.id || k.key === p.key) > -1)
          .map(p => ({ composite: true, id: p.keycloakId }));
      }

      if (selectedRights.length > 0) {
        this.logger.debug(`createRole(...): assigning rights to role:`, selectedRights);
        await client.roles.createComposite({ roleId: id }, selectedRights);
      }

      return id;
    });

    return await this.findByKeycloakId(rawRoleId);
  }

  /**
   * Updates the roles for a user, meaning that it is ensured that
   * the user has the specified roles (= rights contained in this role)
   *
   * @param tenantId The tenantId where the user is created in
   * @param userId The id of the user
   * @param roles The list of roles for the user
   */
  async updateRolesForUser(tenantId: string, userId: string, roles: RoleUnite[]) {
    this.logger.debug(`updateRolesForUser(${tenantId}, ${userId}, ...)`);

    // Compute the changes
    const userRoles = await this.getAllRolesByUserId(userId);
    const hasChanges = !isEqual(sortBy(userRoles.map(r => r.key)), sortBy(roles.map(r => r.key)));

    if (!hasChanges) {
      this.logger.debug(`updateRolesForUser(...): roles didn't change: nothing to do.`);
      return;
    }

    const allRoles = await this.getAllRoles(tenantId);
    const toClear = allRoles.filter(
      r => userRoles.findIndex(p => p.key === r.key || p.id === r.id) > -1,
    );
    const toSet = allRoles.filter(r => roles.findIndex(p => p.key === r.key || p.id === r.id) > -1);

    this.logger.debug(`updateRolesForUser(...): User role update:`);
    this.logger.debug(`toClear=`, toClear);
    this.logger.debug(`toSet=`, toSet);

    // First: clear all
    await this.keycloakRpc.wrapCall(client =>
      client.users.delRealmRoleMappings({
        id: userId,
        roles: toClear.map(r => ({ id: r.keycloakId, name: r.key })),
      }),
    );

    // Then: set the required ones
    await this.keycloakRpc.wrapCall(client =>
      client.users.addRealmRoleMappings({
        id: userId,
        roles: toSet.map(r => ({ id: r.keycloakId, name: r.key })),
      }),
    );

    // Done.
  }

  /**
   * Updates a role by a given tenant id
   *
   * @param tenantId The tenantId where the role is created in
   * @param roleId The id of the role (not Keycloak role id!)
   * @param dto The update data
   * @returns The updated role object
   */
  async updateByTenantId(
    tenantId: string,
    roleId: string,
    dto: Partial<RoleUnite>,
  ): Promise<RoleUnite> {
    this.logger.debug(`updateByTenantId(${tenantId}, ${roleId}, ...)`);

    // Check if exists
    const role = await this.findByIdAndTenantId(tenantId, roleId);
    if (!role) {
      throw new NotFoundException(`No such role to update`);
    }

    if (role.isDefault) {
      throw new ConflictException(`Defaults roles might not be updated!`);
    }

    // Update the role itself
    await this.keycloakRpc.wrapCall(client =>
      client.roles.updateById(
        { id: role.keycloakId },
        {
          // Important: provide the current key --> is not editable
          // otherwise an error will occur (Keycloak)
          name: role.key,
          description: strconv.ParseMultiLangToString(role.name, 'en-EN'),
          composite: true,
          attributes: {
            ...this.keycloakRpc.marshallJsonAttr('name', {
              ...role.name,
              ...(has(dto, 'name') ? dto.name : {}),
            }),
            ...this.keycloakRpc.marshallJsonAttr('description', {
              ...(role.description || {}),
              ...(has(dto, 'description') ? dto.description || {} : {}),
            }),
            ...this.keycloakRpc.marshallAttr(
              'createdAt',
              role.createdAt || new Date().toISOString(),
            ),
            ...this.keycloakRpc.marshallAttr('updatedAt', new Date().toISOString()),
          },
        },
      ),
    );

    // Update the attached rights
    const reqList = uniq((dto.rights || []).map(r => r.id));
    const currList = uniq((role.rights || []).map(r => r.id));
    const changed = !isEqual(sortBy(reqList), sortBy(currList));
    if (changed) {
      this.logger.debug(`updateByTenantId(...): updating attached rights`);
      const current = role.rights.map(p => ({ composite: false, id: p.keycloakId }));

      // Delete all
      await this.keycloakRpc.wrapCall(client =>
        client.roles.delCompositeRoles({ id: role.keycloakId }, current),
      );

      // Add all
      const allRights = await this.getAllRights();
      let selectedRights: { composite: boolean; id: string }[] = [];
      if (dto.rights && Array.isArray(dto.rights)) {
        const rs = dto.rights;
        selectedRights = allRights
          .filter(p => rs.findIndex(k => k.id === p.id || k.key === p.key) > -1)
          .map(p => ({ composite: true, id: p.keycloakId }));
      }

      if (selectedRights.length > 0) {
        await this.keycloakRpc.wrapCall(client =>
          client.roles.createComposite({ roleId: role.keycloakId }, selectedRights),
        );
      }

      this.logger.debug(`updateByTenantId(...): re-attached rights`);
    }

    // Invalidate cache
    this.onInvalidateRolesCacheForTenant(tenantId);

    // Return the edited object
    return await this.findByIdAndTenantId(tenantId, roleId);
  }

  /**
   * Finds a role by id and tenant id
   *
   * @param tenantId The id of the role inside the tenant
   * @param id The id of the role (not keycloak id)
   * @returns The RoleUnite object or throws an exception
   */
  async findByIdAndTenantId(tenantId: string, id: string): Promise<RoleUnite> {
    this.logger.debug(`findByIdAndTenantId(${tenantId}, ${id})`);
    const roleId = await this.getKeycloakIdForExternalId(tenantId, id);

    if (!roleId) {
      throw new NotFoundException(`Role not found`);
    }

    const role = await this.keycloakRpc.wrapCall(client =>
      client.roles.findOneById({
        id: roleId,
      }),
    );

    if (!role) {
      throw new NotFoundException(`Role not found`);
    }

    return await this.toRoleUnite(role);
  }

  /**
   * Deletes a "deletable" (not the default roles) from a tenant and
   * unassigns them from all users
   *
   * @param tenantId The tenant to delete the role from
   * @param id The id of the role (not Keycloak id)
   */
  async deleteByIdAndTenantId(tenantId: string, id: string) {
    this.logger.debug(`deleteByIdAndTenantId(${tenantId}, ${id})`);
    const role = await this.findByIdAndTenantId(tenantId, id);

    if (!role) {
      throw new NotFoundException(`Role not found`);
    }

    if (role.isDefault) {
      throw new BadRequestException(`Default system roles cannot be deleted!`);
    }

    await this.keycloakRpc.wrapCall(client =>
      client.roles.delById({
        id: role.keycloakId,
      }),
    );

    this.onInvalidateRolesCacheForTenant(tenantId);
  }

  // ---

  /**
   * Gets the Keycloak "internal" id of a role by the "external" Shopfloor id
   *
   * @param tenantId The id of the tenant the role exists in
   * @param id The "external" id of the role
   * @returns Either the Keycloak id or `null` if not found
   */
  private async getKeycloakIdForExternalId(tenantId: string, id: string): Promise<string | null> {
    const prefix = getShopfloorIoTenantRolePrefix(tenantId);

    // Check if a tenant role has been requested
    const kkSioTenantRoles = await this.listRolesByPrefixCached(prefix);
    const role = kkSioTenantRoles.find(p => p.id === id);
    if (role) {
      return role.keycloakId;
    }

    // Otherwise check default roles
    const kkSioDefaultRoles = await this.listRolesByPrefixCached(ShopfloorIoRolePrefix);
    const roleDef = kkSioDefaultRoles.find(p => p.id === id);
    if (roleDef) {
      return roleDef.keycloakId;
    }

    return null;
  }

  /**
   * Invalidates any role cache
   *
   * @param tenantId The affected tenant
   */
  private onInvalidateRolesCacheForTenant(tenantId?: string) {
    const all = this.cache
      .keys()
      .filter(p => p.startsWith(CACHEKEY_ROLES) || p.startsWith(CACHEKEY_ALL_ROLES));
    this.cache.del(all);
  }

  /**
   * Lists all available rights in the system
   *
   * @returns The available rights or an empty array
   */
  private async listAllRights(): Promise<RightUnite[]> {
    const rights = await this.keycloakRpc.wrapCall(client =>
      client.roles.find({
        search: ShopfloorIoRightPrefix,
      }),
    );
    return rights.map(this.toRightUnite.bind(this)).filter(r => !!r) || [];
  }

  /**
   * Finds all roles with a certain prefix from the cache
   *
   * @param prefix The prefix of the role(s) to find
   * @returns The matching roles
   */
  private async listRolesByPrefixCached(prefix: string): Promise<RoleUnite[]> {
    const key = `${CACHEKEY_ROLES}_${prefix.replace(/:/g, '-').toUpperCase()}`;
    this.logger.debug(`listRolesByPrefixCached(): ${prefix} -> ${key}`);

    let data = this.cache.get<RoleUnite[]>(key);

    if (!data) {
      data = await this.listRolesByPrefix(prefix);
      this.cache.set(key, data);
      this.logger.debug(`listRolesByPrefixCached(${prefix}): fetched ${data.length} from KK`);
    } else {
      this.logger.debug(`listRolesByPrefixCached(${prefix}): got ${data.length} from CACHE`);
    }

    return data;
  }

  /**
   * See `listRolesByPrefixCached()`. This function is the actual function
   * which is not cached in any way
   *
   * @param prefix The prefix of the role(s) to find
   * @returns The matching roles
   */
  private async listRolesByPrefix(prefix: string): Promise<RoleUnite[]> {
    const roles = await this.keycloakRpc.wrapCall(client =>
      client.roles.find({
        search: prefix,
        // FYI: not supported by the type support of the
        // library, but supported by Keycloak and therefore used here
        // @ts-ignore
        briefRepresentation: false,
      }),
    );
    return await asnycMapThrottled<RoleRepresentation, RoleUnite>(
      this.toRoleUnite.bind(this),
      roles,
      ROLE_PROCESSING_BLOCK_SIZE,
    );
  }

  /**
   * Transforms a Keycloak `RoleRepresentation` into an internal
   * `RoleUnite` object and fetches further meta data
   *
   * @param role The Keycloak `RoleRepresentation`
   * @returns The `RoleUnite` for further use
   */
  private async toRoleUnite(role: RoleRepresentation): Promise<RoleUnite> {
    const key = `${CACHEKEY_RIGHTS_FOR_ROLE}_${role.id || ''}`;
    const exists = this.cache.get<RoleUnite>(key);
    if (exists) {
      this.logger.debug(`toRoleUnite(${role.id}): CACHE HIT`);
      return exists;
    }

    // Find all rights assigned to this role
    const rr = await this.keycloakRpc.wrapCall(client => {
      return client.roles.getCompositeRoles({ id: role.id || '' });
    });

    // Build the result object
    const data = {
      id: mapRightKeyToUUID(role.name || ''),
      keycloakId: role.id,
      key: role.name,
      name: this.keycloakRpc.getAttOrDefJson<MultilangValue>(role, 'name', UnknownRoleName),
      description: this.keycloakRpc.getAttOrDefJson<MultilangValue>(role, 'description', {}),
      rights: rr.map(this.toRightUnite.bind(this)) || [],
      isDefault: `${role.name || ''}`.startsWith(ShopfloorIoRolePrefix),
      createdAt: this.keycloakRpc.getAttOrDef<string | null>(role, 'createdAt', null),
      updatedAt: this.keycloakRpc.getAttOrDef<string | null>(role, 'updatedAt', null),
    } as RoleUnite;

    this.cache.set<RoleUnite>(key, data, 14);

    return data;
  }

  /**
   * Transforms a Keycloak `RoleRepresentation` into an internal `RightUnite`
   * object
   *
   * @param right The Keycloak `RoleRepresentation`
   * @returns The `RightUnite` object
   */
  private toRightUnite(right: RoleRepresentation): RightUnite {
    return {
      id: mapRightKeyToUUID(right.name || ''),
      keycloakId: right.id,
      key: right.name,
      description: RightDescriptions[right.name || ''] || UnknownRightDescription,
    } as RightUnite;
  }

  /**
   * Use function `getAllRoles()`. This function is the uncached version
   * to fetch all roles existent in a tenant (including all system default
   * roles)
   *
   * @param tenantId The id of the tenant
   * @returns An array of roles or an empty array
   */
  private async getAllRolesUncached(tenantId: string | null): Promise<RoleUnite[]> {
    this.logger.debug(`getAllRolesUncached(${tenantId})`);

    // Find all default Shopfloor roles
    const kkSioStdRoles = await this.listRolesByPrefixCached(ShopfloorIoRolePrefix);
    this.logger.debug(`getAllRoles(): found ${kkSioStdRoles.length} default SIO role(s)`);

    // Find all tenant-specific roles
    let kkSioTenantRoles: RoleUnite[] = [];
    if (tenantId) {
      const prefix = getShopfloorIoTenantRolePrefix(tenantId);
      this.logger.debug(`Fetch tenant roles by prefix: '${prefix}'`);
      kkSioTenantRoles = await this.listRolesByPrefixCached(prefix);
    }
    this.logger.debug(`getAllRoles(): found ${kkSioTenantRoles.length} tenant role(s)`);

    // Combine, sort and return
    const all = [...kkSioStdRoles, ...kkSioTenantRoles];
    all.sort((a, b) => {
      return a.key.localeCompare(b.key);
    });
    return all;
  }

  /**
   * Finds a role not by the role id (from Shopfloor) but by the Keycloak
   * assigned id (see `RoleUnite#keyloakId`)
   *
   * @param kkRoleId The Keycloak id
   * @returns The RoleUnite object or throws an exception if not found
   */
  private async findByKeycloakId(kkRoleId: string): Promise<RoleUnite> {
    const role = await this.keycloakRpc.wrapCall(client =>
      client.roles.findOneById({
        id: kkRoleId,
      }),
    );

    if (!role) {
      throw new NotFoundException(`Role not found`);
    }

    return await this.toRoleUnite(role);
  }
}
