import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceModule } from '../device/device.module';
import { DeviceSubscriber } from './device.subscriber';
import { GrafanaService } from './grafana.service';
import { OrganizationController } from './organization.controller';
import { OrganizationEntity } from './organization.entity';
import { OrganizationService } from './organization.service';
import { TenantMigrationGrafanaOrganization004 } from './tenant-migrations/004-grafana-organization.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([OrganizationEntity]),
    forwardRef(() => DeviceModule),
  ],
  providers: [
    OrganizationService,
    GrafanaService,
    DeviceSubscriber,
    TenantMigrationGrafanaOrganization004,
  ],
  controllers: [OrganizationController],
  exports: [OrganizationService, GrafanaService, TenantMigrationGrafanaOrganization004],
})
export class OrganizationModule {}
