import { ApiProperty } from '@rewiko/crud/lib/crud';

import { MachineVariableEntity } from './machine-variable.entity';

export interface MachineVariableDto {
  id: string;
  name: string;
  parameterId: string;
  unit?: string;
  assetTypeId: string;
  createdAt: string;
  updatedAt: string;
}

export class MachineVariableClassDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  parameterId!: string;

  @ApiProperty()
  unit?: string;

  @ApiProperty()
  assetTypeId!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export function toExternal(entity: MachineVariableEntity): MachineVariableDto {
  return {
    id: entity.id,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    name: entity.name,
    parameterId: entity.parameterId,
    unit: entity.unit,
    assetTypeId: entity.assetTypeId,
  };
}
