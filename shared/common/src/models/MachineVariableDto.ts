export interface CreateMachineVariableDto {
  name: string;
  parameterId: string;
  unit?: string;
  assetTypeId: string;
}

export interface MachineVariableDto extends CreateMachineVariableDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
