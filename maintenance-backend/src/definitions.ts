import * as path from 'path';

export const TABLE_PREFIX = 'sio_mnt__';
export const MIGRATION_TABLE_NAME = TABLE_PREFIX + '__migrations';
export const MIGRATION_PATH = path.join(__dirname + '/migrations/*.{ts,js}');
export const ENTITIES_PATHS = [path.join(__dirname + '/**/*.entity.{ts,js}')];

export const ENDPOINT_QUERY_CACHE_TIME = 2000; // ms
export const ENDPOINT_RESULT_QUERY_LIMIT = 2000; // items per page
export const ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS = 25;
