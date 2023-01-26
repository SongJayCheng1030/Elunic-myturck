import * as path from 'path';

export const TABLE_PREFIX = 'sio_cm__';
export const MIGRATION_TABLE_NAME = TABLE_PREFIX + '__migrations';
export const MIGRATION_PATH = path.join(__dirname + '/migrations/*.{ts,js}');
export const ENTITIES_PATHS = [path.join(__dirname + '/**/*.entity.{ts,js}')];

export const DATALAKE_MIGRATION_TABLE_NAME = 'migrations';
export const DATALAKE_MIGRATION_PATH = path.join(__dirname + '/datalake-migrations/*.{ts,js}');

export const SETTING__OEE_KPI_GOAL = 'OEE_KPI_GOAL';
export const SETTING__YIELD_KPI_GOAL = 'OEE_YIELD_GOAL';
export const SETTING__AVAILABILITY_KPI_GOAL = 'OEE_AVAILABILITY_GOAL';
export const SETTING__UTILIZATION_KPI_GOAL = 'OEE_UTILIZATION_GOAL';
export const SETTING__THROUGHPUT_THRESHOLD = 'THROUGHPUT_THRESHOLD';
export const SETTING__OEE_MONITORING_DETAILS_THRESHOLD = 'OEE_MONITORING_DETAILS_THRESHOLD';

/**
 * Name of the tag for dynamic grafana dashboards
 */
export const DYNAMIC_GF_PANEL_TAG = 'shopfloor.io:assetId';

export const ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS = 25;
export const ENDPOINT_QUERY_CACHE_TIME = 2000; // ms
export const ENDPOINT_RESULT_QUERY_LIMIT = 2000; // items per page

export const GRAFANA_PATH = '/v1/grafana';
