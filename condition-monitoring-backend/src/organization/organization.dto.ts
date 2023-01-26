import { TenantId } from 'shared/common/types';

import { DeviceDto } from '../device/device.dto';

export interface GrafanaOrg {
  address: {
    address1: string;
    address2: string;
    city: string;
    country: string;
    state: string;
    zipCode: string;
  };
  id: number | string;
  name: string;
}

export interface OrganizationDto extends Omit<GrafanaOrg, 'id'> {
  id: string;
  tenantId: TenantId;
  devices: DeviceDto[];
}
