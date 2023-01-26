import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GeneralController } from './general/general.controller';
import { GeneralEntity } from './general/general.entity';
import { GeneralService } from './general/general.service';
import { StaticSettingsController } from './static-settings/static-settings.controller';
import { StaticSettingsService } from './static-settings/static-settings.service';
import { TenantMigrationCreateHubBackground002 } from './tenant-migrations/002-create-hub-background';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([GeneralEntity])],
  controllers: [GeneralController, StaticSettingsController],
  providers: [GeneralService, StaticSettingsService, TenantMigrationCreateHubBackground002],
  exports: [TenantMigrationCreateHubBackground002],
})
export class GeneralSettingModule {}
