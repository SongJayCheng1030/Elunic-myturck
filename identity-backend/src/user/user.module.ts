import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '../config/config.module';
import { KeycloakModule } from '../keycloak/keycloak.module';
import { TenantModule } from '../tenant/tenant.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';
import { DeletedActorEntity } from './users/deleted-actor.entity';
import { MeController } from './users/me.controller';
import { UserNamesController } from './users/user-names.controller';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    ConfigModule,
    TenantModule,
    KeycloakModule,
    TypeOrmModule.forFeature([DeletedActorEntity]),
  ],
  controllers: [
    AuthController,
    UsersController,
    MeController,
    UserNamesController,
    RolesController,
  ],
  providers: [AuthService, UsersService, RolesService],
  exports: [],
})
export class UserModule implements OnModuleInit {
  constructor(private readonly rolesService: RolesService) {}

  async onModuleInit() {
    await this.rolesService.init();
  }
}
