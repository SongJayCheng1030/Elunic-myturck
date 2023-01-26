export enum SensorType {
  LOG = 'log',
  SERIES = 'series',
  SWITCH = 'switch',
}

export interface DeviceDto {
  id: string;
  assetId: string | null;
  sensors: SensorDto[];
}

export interface SensorDto {
  id: string;
  type: SensorType;
}

export interface GroupDto {
  id: string;
  name: string;
}
