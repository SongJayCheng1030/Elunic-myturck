import { Module } from '@nestjs/common';

import { ConfigService } from '../config/config.service';
import { MachineController } from './machine.controller';
import { MachineService } from './machine.service';

@Module({
  imports: [],
  controllers: [MachineController],
  providers: [ConfigService, MachineService],
})
export class MachineModule {}
