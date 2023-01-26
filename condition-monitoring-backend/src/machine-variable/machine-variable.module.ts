import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigService } from '../config/config.service';
import { MachineVariableController } from './machine-variable.controller';
import { MachineVariableEntity } from './machine-variable.entity';
import { MachineVariableService } from './machine-variable.service';

@Module({
  imports: [TypeOrmModule.forFeature([MachineVariableEntity])],
  controllers: [MachineVariableController],
  providers: [ConfigService, MachineVariableService],
  exports: [MachineVariableService],
})
export class MachineVariableModule {}
