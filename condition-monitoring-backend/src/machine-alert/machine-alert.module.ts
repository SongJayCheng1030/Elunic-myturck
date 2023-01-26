import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigService } from '../config/config.service';
import { MachineAlertController } from './machine-alert.controller';
import { MachineAlertEntity } from './machine-alert.entity';
import { MachineAlertService } from './machine-alert.service';

@Module({
  imports: [TypeOrmModule.forFeature([MachineAlertEntity])],
  controllers: [MachineAlertController],
  providers: [ConfigService, MachineAlertService],
})
export class MachineAlertModule {}
