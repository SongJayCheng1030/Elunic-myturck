export enum SensorType {
  LOG = 'log',
  SERIES = 'series',
  SWITCH = 'switch',
}

export interface DeviceDto {
  id: string;
  assetId: string | null;
}

export interface SensorDto {
  id: string;
  type: SensorType;
}

export interface SensorConfig extends Record<string, unknown> {
  window: number;
  onChange: boolean;
}

export interface SensorWithConfigDto extends SensorDto {
  config: SensorConfig;
}

export interface DataSinkDto {
  id: string;
  name: string;
  type: string;
  deviceId: string;
  config: any;
}

export interface SinkConfig extends Record<string, unknown> {
  retention?: number;
}
