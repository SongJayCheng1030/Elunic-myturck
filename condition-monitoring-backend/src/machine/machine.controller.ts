import { Controller, Get, Param } from '@nestjs/common';
import { MachineDetailsDto, MachineState, MachineStateDto } from 'shared/common/models';

import { MachineAlertDto } from '../machine-alert/MachineAlertDto';
import { MachineService } from './machine.service';

@Controller('machine')
export class MachineController {
  constructor(private machineService: MachineService) {}

  @Get('current-states/:deviceId')
  getCurrentStates(@Param('deviceId') deviceId: string): Promise<MachineStateDto[]> {
    return this.machineService.getCurrentStates(deviceId);
  }

  @Get('current-state/:deviceId')
  getCurrentState(@Param('deviceId') deviceId: string): Promise<{ state: MachineState }> {
    return this.machineService.getCurrentState(deviceId);
  }

  @Get('alerts/:deviceId')
  getNotifications(@Param('deviceId') deviceId: string): Promise<MachineAlertDto[]> {
    return this.machineService.getActiveAlarms(deviceId);
  }

  @Get('details/:deviceId')
  getMachineDetails(): MachineDetailsDto {
    // mock data
    return { type: 'E320MX', serialNumber: 'E170820' };
  }
}
