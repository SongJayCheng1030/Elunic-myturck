import { Module, OnModuleInit } from '@nestjs/common';

import { KeycloakRolesService } from './keycloak-roles.service';
import { KeycloakRpcService } from './keycloak-rpc.service';
import { KeycloakTenantsService } from './keycloak-tenants.service';
import { KeycloakUsersService } from './keycloak-users.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    KeycloakUsersService,
    KeycloakTenantsService,
    KeycloakRpcService,
    KeycloakRolesService,
  ],
  exports: [KeycloakTenantsService, KeycloakUsersService, KeycloakRolesService],
})
export class KeycloakModule implements OnModuleInit {
  constructor(
    private readonly keycloakTenants: KeycloakTenantsService,
    private readonly keycloakRolesService: KeycloakRolesService,
  ) {}

  async onModuleInit() {
    await this.keycloakRolesService.init();
    await this.keycloakTenants.init();
  }
}
