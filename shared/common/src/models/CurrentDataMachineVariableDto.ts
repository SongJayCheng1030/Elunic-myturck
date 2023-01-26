import { MachineVariableDto } from './MachineVariableDto';

export interface CurrentValueAndMachineVariableDto {
  machineVariable: MachineVariableDto;
  value: number;
  time: Date;
}
