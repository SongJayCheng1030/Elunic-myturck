import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceModule } from '../device/device.module';
import { MachineVariableModule } from '../machine-variable/machine-variable.module';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { SeriesEntity } from './entity/series.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SeriesEntity], 'data_lake'),
    DeviceModule,
    MachineVariableModule,
  ],
  providers: [DataService],
  controllers: [DataController],
  exports: [DataService],
})
export class DataModule {}
