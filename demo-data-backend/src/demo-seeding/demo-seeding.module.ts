import { HttpModule, Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { DemoSeedingController } from './demo-seeding.controller';
import { TenantMigrationCreateAssets001 } from './tenant-migrations/001-create-assets';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [DemoSeedingController],
  providers: [TenantMigrationCreateAssets001],
  exports: [TenantMigrationCreateAssets001],
})
export class DemoSeedingModule {}
