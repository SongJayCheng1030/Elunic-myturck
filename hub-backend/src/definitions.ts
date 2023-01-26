import * as path from 'path';

export const TABLE_PREFIX = 'hub__';
export const MIGRATION_TABLE_NAME = TABLE_PREFIX + '__migrations';
export const MIGRATION_PATH = path.join(__dirname + '/migrations/*.{ts,js}');
