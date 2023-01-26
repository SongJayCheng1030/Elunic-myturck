import { Global, HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '../config/config.module';
import { SettingsController } from './settings.controller';
import { SettingEntity } from './settings.entity';
import { SettingsService } from './settings.service';
import { TenantMigrationInitSettings001 } from './tenant-migrations/001-init-settings.service';

@Global()
@Module({
  providers: [SettingsService, TenantMigrationInitSettings001],
  imports: [ConfigModule, HttpModule, TypeOrmModule.forFeature([SettingEntity])],
  controllers: [SettingsController],
  exports: [SettingsService, TenantMigrationInitSettings001],
})
export class SettingsModule {}
