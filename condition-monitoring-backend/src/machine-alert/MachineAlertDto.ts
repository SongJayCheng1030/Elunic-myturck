import { ApiProperty } from '@rewiko/crud/lib/crud';

import { MachineAlertEntity, SeverityType } from './machine-alert.entity';

export interface MachineAlertDto {
  id: string;
  severity: SeverityType;
  timestamp: string;
  code: string;
  text: string;
}
export class MachineAlertClassDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  severity!: SeverityType;

  @ApiProperty()
  timestamp!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  text!: string;
}

export function toExternal(ety: MachineAlertEntity): MachineAlertDto {
  return {
    ...ety,
    timestamp: ety.timestamp?.toISOString(),
  };
}
