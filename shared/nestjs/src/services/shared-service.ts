export enum SharedService {
  FILE_SERVICE = 'fileServiceUrl',
  ASSET_SERVICE = 'assetServiceUrl',
  USER_SERVICE = 'userServiceUrl',
}

// TODO: FIXME
// @deprecated Should be replaced
export const SharedServiceEnumMap = {
  fileServiceUrl: 'APP_SERVICE_URL_FILE',
  assetServiceUrl: 'APP_SERVICE_URL_ASSET',
  userServiceUrl: 'APP_SERVICE_URL_IDENTITY',
};

/* DO NOT CHANGE! AUTOMATICALLY GENERATED! */ export const LOCAL_PORT_MAP = {
  APP_SERVICE_URL_ASSET: 'http://host.docker.internal:13001',
  APP_SERVICE_URL_CONDITION_MONITORING: 'http://host.docker.internal:13002',
  APP_SERVICE_URL_FILE: 'http://host.docker.internal:13003',
  APP_SERVICE_URL_HUB: 'http://host.docker.internal:13004',
  APP_SERVICE_URL_MAINTENANCE: 'http://host.docker.internal:13005',
  APP_SERVICE_URL_IDENTITY: 'http://host.docker.internal:13007',
  APP_SERVICE_URL_DEMO_DATA: 'http://host.docker.internal:13008',
};
