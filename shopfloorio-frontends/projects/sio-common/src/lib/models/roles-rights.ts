import { MultilangValue } from 'shared/common/models';

export interface Role {
  id: string;
  key: string;
  name: MultilangValue;
  description?: MultilangValue;
  rights: Right[];
  createdAt?: string | null;
  updatedAt?: string | null;
  isDefault?: boolean;
}

export interface Right {
  key: string;
  id: string;
  description: MultilangValue;
}
