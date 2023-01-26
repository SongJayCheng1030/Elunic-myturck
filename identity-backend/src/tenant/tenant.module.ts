import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KeycloakModule } from '../keycloak/keycloak.module';
import { TenantSettingsModule } from '../tenant-settings/tenant-settings.module';
import { TenantController } from './tenant.controller';
import { TenantEntity } from './tenant.entity';
import { TenantService } from './tenant.service';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity]), KeycloakModule, TenantSettingsModule],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
