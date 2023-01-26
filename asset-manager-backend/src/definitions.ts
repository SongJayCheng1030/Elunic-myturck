import * as path from 'path';
import { ISA95EquipmentHierarchyModelElement, MultilangValue } from 'shared/common/models';

export const TABLE_PREFIX = 'sio_assets__';
export const MIGRATION_TABLE_NAME = TABLE_PREFIX + '__migrations';
export const MIGRATION_PATH = path.join(__dirname + '/migrations/*.{ts,js}');
export const ENTITIES_PATHS = [path.join(__dirname + '/**/*.entity.{ts,js}')];

export const ENDPOINT_QUERY_CACHE_TIME = 2000; // ms
export const ENDPOINT_RESULT_QUERY_LIMIT = 2000; // items per page
export const ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS = 25;

export const TREE_CACHE_TIME = 120000; // ms
export const TREE_CACHE_KEY = '_tree';

export const ASSET_TYPE_CACHING = 120000; // ms

export const BUILTIN_GENERIC_ASSET_TYPE_NAME: MultilangValue = {
  de_DE: 'Allgemein',
  en_EN: 'Generic',
};

export const BUILTIN_GENERIC_ASSET_TYPE_EQUIPMENT_TYPE = ISA95EquipmentHierarchyModelElement.NONE;
