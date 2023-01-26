import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantMigrationCreateInitialHubTiles001 } from './tenant-migrations/001-create-initial-hub-tiles.service';
import { TileConfigurationController } from './tile-configuration/tile-configuration.controller';
import { TileConfigurationEntity } from './tile-configuration/tile-configuration.entity';
import { TileConfigurationService } from './tile-configuration/tile-configuration.service';

@Global()
@Module({
  providers: [TileConfigurationService, TenantMigrationCreateInitialHubTiles001],
  imports: [TypeOrmModule.forFeature([TileConfigurationEntity])],
  controllers: [TileConfigurationController],
  exports: [TenantMigrationCreateInitialHubTiles001],
})
export class TileConfigurationModule {}
