import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  asnycMapThrottled,
  KeycloakTenantGroupPrefix,
  KeycloakTenantsAllRootGroupName,
} from 'shared/nestjs';

import { TenantUnite } from './dto/TenantUnite';
import { KeycloakRpcService } from './keycloak-rpc.service';

/**
 * The request block size for pagination
 */
const TENANT_ASYNC_BATCH_SIZE = 21;

/**
 * This service provides an API to utilize Keycloaks functionality
 * to provide the mechanism of tenants to this service. For Shopfloor
 * tenants the feature of Keycloak groups are used
 */
@Injectable()
export class KeycloakTenantsService {
  private allTenantsGroupId!: string;

  constructor(
    private readonly keycloakRpc: KeycloakRpcService,
    @InjectLogger(`KeycloakTenantsService`)
    private readonly logger: Logger,
  ) {}

  /**
   * Initialises the tenant service and creates the
   */
  async init() {
    await this.keycloakRpc.ensureConnected();
    this.allTenantsGroupId = await this.getIdOfTenantByNameOrCreate(
      KeycloakTenantsAllRootGroupName,
    );
    this.logger.info(`init(): allTenantsGroupId=${this.allTenantsGroupId}`);
  }

  /**
   * Fetches a list of all tenants available in the system from
   * Keycloak. Important: since no pagination is used, this function
   * can be slow if there are many tenants available
   *
   * @returns Always an array of tenants of at least length 0
   */
  async findTenants(): Promise<TenantUnite[]> {
    const groups = await this.keycloakRpc.wrapCall(
      client => {
        return client.groups.find({
          search: `${KeycloakTenantGroupPrefix}`,
        });
      },
      (_, err) => {
        throw new InternalServerErrorException(`Cannot fetch tenants: ${err.message}`);
      },
    );

    if (!groups) {
      throw new NotFoundException(`Failed to fetch list of tenants`);
    }

    // Transform to tenants
    const tenants = await asnycMapThrottled(
      this.toTenantUnite.bind(this),
      groups || [],
      TENANT_ASYNC_BATCH_SIZE,
    );

    this.logger.debug(`findTenants(): found ${tenants.length} tenants in system`);
    return tenants || [];
  }

  /**
   * Finds all tenants assigned to a specific user
   *
   * @param id The id of the user to query
   * @returns A list of tenants assigned to this user
   */
  async findTenantsForUser(id: string): Promise<TenantUnite[]> {
    const groups = await this.keycloakRpc.wrapCall(
      client => {
        return client.users.listGroups({ id });
      },
      (hs, err) => {
        const id = this.keycloakRpc.printErrorInformation(err, 'Find tenants for user', hs);
        throw new InternalServerErrorException(`Cannot find tenants for user (error id: ${id})`);
      },
    );

    const tenants = await this.findTenants();

    // Find group ids of the current user
    const keycloakGroupIds = groups.map(t => t.id);
    this.logger.debug(`findTenantsForUser(${id}): keycloakGroupIds=${keycloakGroupIds.join(', ')}`);

    return tenants.filter(t => keycloakGroupIds.includes(t.keycloakId)) || [];
  }

  /**
   * Finds a "tenant" (Keycloak group) by the keycloak internal id
   *
   * @param keycloakId The id of the Keycloak group/"tenant"
   * @returns Either `null` if not found or the `TenantUnite` object
   * for the tenant
   */
  async byKeycloakId(keycloakId: string): Promise<TenantUnite | null> {
    const grp = await this.keycloakRpc.wrapCall(
      client => {
        return client.groups.findOne({ id: keycloakId });
      },
      (_, err) => {
        throw new InternalServerErrorException(`No such tenant found in Keycloak: ${err.message}`);
      },
    );

    if (!grp) {
      return null;
    }

    return this.toTenantUnite(grp);
  }

  /**
   * Finds a "tenant" (Keycloak group) by the tenant name, aka.
   * the Keycloak group name
   *
   * @param tenantId The tenant id to search for
   * @returns Either `null` if not found or the `TenantUnite` object
   * for the tenant
   */
  async byTenantId(tenantId: string): Promise<TenantUnite | null> {
    const tenants = await this.findTenants();
    const tenant = tenants.find(t => t.tenantId === tenantId);

    if (!tenant) {
      return null;
    }

    return this.byKeycloakId(tenant.keycloakId);
  }

  /**
   * Removes a tenant (group) from Keycloak by the Keycloak internal
   * group id
   *
   * @param keycloakId The tenant Keycloak id for a group
   */
  async removeById(keycloakId: string): Promise<void> {
    this.logger.debug(`removeById(${keycloakId})`);

    if (!this.allTenantsGroupId || this.allTenantsGroupId === keycloakId) {
      this.logger.error(`Somehow it was tried to remove KK group ${keycloakId}`);
      this.logger.error(`but this matches the all-tenants group ${this.allTenantsGroupId}`);
      this.logger.error(`This is a serious bug and requires investigation!`);
      throw new InternalServerErrorException(`Operation failed.`);
    }

    await this.keycloakRpc.wrapCall(
      client => {
        return client.groups.del({
          id: keycloakId,
        });
      },
      (_, err) => {
        throw new InternalServerErrorException(`Cannot delete tenant: ${err.message}`);
      },
    );
  }

  /**
   * Creates a new tenant in Keycloak by creating a new group
   *
   * @param id The id of the new tenant, later provided via `TenantUnite#tenantId`.
   * The Keycloak internal (group) id is provided via `TenantUnite#keycloakId`.
   * @param data The data of the new tenant
   * @returns The newly created tenant object
   */
  async create(id: string): Promise<TenantUnite> {
    const name = KeycloakTenantsService.toKeycloakGroupName(id);
    this.logger.debug(`create(${id}, ...): name=${name}`);

    const group = await this.keycloakRpc.wrapCall(
      client => {
        return client.groups.create({
          name,
        });
      },
      (httpStatus, err) => {
        if (httpStatus === 409) {
          throw new ConflictException(`Tenant ${id} already exists`);
        }
        throw new InternalServerErrorException(`Cannot create a new tenant: ${err.message}`);
      },
    );

    // Read out the updated entity
    const created = await this.byKeycloakId(group.id);

    if (!created) {
      this.logger.error(`Cannot read-out the Keycloak group after creating it: ${id}`);
      throw new InternalServerErrorException(`Cannot create tenant: fatal internal error`);
    }

    return created;
  }

  /**
   * Adds a user to a Keycloak group by kkGroupId and user id
   *
   * @param kkGroupId The id of the keycloak group the user should
   * be added to
   * @param userId The id of the user to add
   */
  async addUserToTenantByIdByKeycloakGroupId(kkGroupId: string, userId: string) {
    await this.keycloakRpc.wrapCall(client =>
      client.users.addToGroup({ id: userId, groupId: kkGroupId }),
    );
  }

  /**
   * Adds a user to a tenant by translating the tenantId to a Keycloak group
   * id and calling `addUserToTenantByIdByKeycloakGroupId()`
   *
   * @param tenantId The id of the tenant to add the user to
   * @param userId The id of the user to add
   */
  async addUserToTenantByIdByUserId(tenantId: string, userId: string) {
    const tenant = await this.byTenantId(tenantId);

    if (!tenant) {
      throw new NotFoundException(`No such tenant`);
    }

    return await this.addUserToTenantByIdByKeycloakGroupId(tenant.keycloakId, userId);
  }

  // ---

  /**
   * Returns the id of the Keycloak root-group matched by it's name. If
   * suche group does not exist, a new one is created
   *
   * @param name The name of the tenant
   * @returns The id of the tenant with the given name
   */
  private async getIdOfTenantByNameOrCreate(name: string): Promise<string> {
    const findAndGet = async (client: KeycloakAdminClient) => {
      const groups = await client.groups.find({
        search: name,
        briefRepresentation: false,
      });
      return groups.find(g => g.path === `/${name}`);
    };

    return await this.keycloakRpc.wrapCall<string>(async client => {
      let group = await findAndGet(client);
      if (!group) {
        this.logger.debug(`getIdOfTenantRootGroupByNameOrCreate(${name}): not found, creating`);

        await client.groups.create({
          name,
        });

        group = await findAndGet(client);
      }

      if (!group || !group.id) {
        this.logger.error(
          `Failed to create group '${name}' in Keycloak. Please check the permissions!`,
        );
        throw new InternalServerErrorException(
          `Cannot create group in Keycloak. Check permissions.`,
        );
      }

      return group.id;
    });
  }

  /**
   * Transforms a Keycloak `GroupRepresentation` into a tenant
   * data structure `TenantUnite`
   *
   * @param group The Keycloak `GroupRepresentation` object
   * @returns The `TenantUnite` object
   */
  private async toTenantUnite(group: GroupRepresentation): Promise<TenantUnite> {
    return {
      keycloakId: group.id || '',
      tenantId: (group.name || '').substring(KeycloakTenantGroupPrefix.length),
    } as TenantUnite;
  }

  /**
   * Transforms a (Shopfloor) tenant id into a Keycloack group name
   * by composing them
   *
   * @param tenantId The tenant id (from Shopfloor)
   * @returns The Keycloak group name
   */
  static toKeycloakGroupName(tenantId: string): string {
    return `${KeycloakTenantGroupPrefix}${tenantId}`;
  }

  /**
   * Extracts the tenant id (Shopfloor) from a Keycloak
   * group name
   *
   * @param keycloakGroupName The Keycloak group name
   * @returns The tenant id (not checked any further)
   */
  static toTenantId(keycloakGroupName: string): string {
    return (keycloakGroupName || '').substring(KeycloakTenantGroupPrefix.length);
  }
}
