export interface TenantSettingsDto {
  id?: string;
  key: string;
  value: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface TenantDto {
  id: string;
  name: string;
  updatedAt: string;
  ownerId: string;
  status: boolean;
  tenantSettings?: TenantSettingsDto[];
  createdAt?: string;
}

export enum MAINTENANCE_INTERVAL_SETTING {
  STRICT_INTERVAL = 'strictInterval',
  ON_EXECUTION = 'onExecution',
}
export const MAINTENANCE_INTERVAL_CALCULATION_SETTING_KEY = 'maintenance-interval-start'
export const TENANT_DEVICE_GROUP_SETTING_KEY = 'device-group-id'