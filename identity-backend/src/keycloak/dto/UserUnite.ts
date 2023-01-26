import { FreeData } from '../../user/dto/FreeData';

export interface UserUnite {
  id: string;
  name: string;
  email: string;
  activated: boolean;
  firstName: string | null;
  lastName: string | null;
  imageId: string | null;
  preferredLanguage: string | null;
  tenantId: string | null;
  freeData: FreeData | null;
  roles: {
    id: string;
    key: string;
    isDefault: boolean;
  }[];
}

export type UserUniteReadWrite = Omit<UserUnite, 'freeData' | 'id' | 'tenantId' | 'roles'>;
