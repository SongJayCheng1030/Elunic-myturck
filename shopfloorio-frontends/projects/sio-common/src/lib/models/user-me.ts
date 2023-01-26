import { MultilangValue } from 'shared/common/models';

export interface UserMeDto {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageId?: string;
  tenantId: string;
  preferredLanguage?: string | null;
  roles: Array<{
    id: string;
    key: string;
    isDefault: boolean;
    name: MultilangValue;
  }>;
  iat: number;
  exp: number;
  rights: string[];
  isMultiTenantAdmin: boolean;
  tenants: string[];
}
