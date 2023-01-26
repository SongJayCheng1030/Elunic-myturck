export interface BaseMessage {
  topic: string;
}

export type Input = (MeasurementMessage | EventMessage | InventoryMessage) & BaseMessage;

export type Topic = 'measurements' | 'events' | 'inventory';

export interface MeasurementMessage {
  creationTime: number;
  id: string;
  'source.type': string;
  tenantId: string;
  measurements: Measurements;
  'source.name': null;
  type: string;
  'source.value': string;
  time: number;
  source: string;
}

export interface Measurements {
  [key: string]: Record<string, Value>;
}

export interface Value {
  value: number;
  unit?: string;
}

export interface EventMessage {
  creationTime: number;
  id: string;
  tenantId: string;
  '.apama_notificationType': string;
  'source.name': string;
  'source.type': string;
  text: string;
  lastUpdated: number;
  type: string;
  'source.value': string;
  time: number;
  value: string;
  source: string;
}

export interface InventoryMessage {
  creationTime: number;
  id: string;
  childAdditionIds: any[];
  '.apama_notificationType': string;
  owner: string;
  position: C8YIsAsset;
  assetParentIds: any[];
  supportedMeasurements: any[];
  icon?: Icon;
  type: string;
  childAssetIds: string[];
  tenantId: string;
  name: string;
  _fragments: string[];
  childDeviceIds: any[];
  c8y_IsAsset?: C8YIsAsset;
  deviceParentIds: any[];
  supportedOperations: any[];
  c8y_IsDeviceGroup?: C8YIsAsset;
  parentName?: string;
  lastUpdated: number;
  description?: string;
}

export interface C8YIsAsset {}

export interface Icon {
  name: string;
  category: string;
}
