import { Global, HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '../config/config.module';
import { MachineVariableModule } from '../machine-variable/machine-variable.module';
import { OrganizationModule } from '../organization/organization.module';
import { GrafanaBuildingsetController } from './grafana-buildingset.controller';
import { GrafanaBuildingsetService } from './grafana-buildingset.service';
import { GrafanaBuildingsetTileController } from './grafana-buildingset-tile.controller';
import { GrafanaTileEntity } from './grafana-tile.entity';

@Global()
@Module({
  providers: [GrafanaBuildingsetService],
  imports: [
    ConfigModule,
    HttpModule,
    OrganizationModule,
    TypeOrmModule.forFeature([GrafanaTileEntity]),
    MachineVariableModule,
  ],
  controllers: [GrafanaBuildingsetController, GrafanaBuildingsetTileController],
  exports: [GrafanaBuildingsetService],
})
export class GrafanaBuildingsetModule {}
