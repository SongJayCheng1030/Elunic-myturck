import { MultilangValue } from 'shared/common/models';

export type AssetPropertyValue = number | string | Date | boolean;

export enum AssetPropertyType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  FILE = 'FILE',
}

export interface UnitedPropertyDto {
  id: string;
  key: string;
  name: MultilangValue;
  type: string;
  createdAt: string;
  updatedAt: string;
  value: AssetPropertyValue | null;
  position: number | null;
  isHidden: boolean | null;
  isRequired: boolean | null;
}
