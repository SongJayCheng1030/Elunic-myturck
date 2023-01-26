import { Logger } from '@elunic/logger';
import { MultilangValue } from 'shared/common/models';
import { mapRightKeyToUUID, ShopfloorRight } from 'shared/nestjs';
import { RightUnite, RoleUnite } from 'src/keycloak/dto/RoleUnite';

import { KeycloakRolesService } from '../../../keycloak/keycloak-roles.service';
import { KeycloakTenantsService } from '../../../keycloak/keycloak-tenants.service';
import { KeycloakUsersService } from '../../../keycloak/keycloak-users.service';

export type AddRoleMigrationFunc = (
  logger: Logger,
  rolesService: KeycloakRolesService,
  userService: KeycloakUsersService,
  tenantService: KeycloakTenantsService,
) => Promise<void>;

export interface MigrationRoleDto {
  key: string;
  name: MultilangValue;
  description: MultilangValue;
  rights: ShopfloorRight[];
}

export function toRoleUnite(role: MigrationRoleDto): RoleUnite {
  return {
    ...role,
    rights: role.rights.map(r => ({ id: mapRightKeyToUUID(r), key: r })) as RightUnite[],
  } as RoleUnite;
}

export function createRoleFunc(ROLE: MigrationRoleDto) {
  return async (logger: Logger, roleService: KeycloakRolesService) => {
    // Does the role already exist?
    const exists = await roleService.getRoleByKey(ROLE.key);
    if (exists) {
      logger.debug(`Role '${ROLE.key}' already exists. Skipping.`);
      return;
    }

    // Otherwise create
    await roleService.createRole(toRoleUnite(ROLE));
  };
}
