export const environment = {
  production: true,
  sessionCookieName: '__sfio_session',
  assetServiceUrl: new URL('/service/asset/', window.location.origin).href,
  fileServiceUrl: new URL('/service/file/', window.location.origin).href,
  hubServiceUrl: new URL('/service/hub/', window.location.origin).href,
  userServiceUrl: new URL('/service/identity/', window.location.origin).href,
  tenantServiceUrl: new URL('/service/tenant/', window.location.origin).href,
  tenantsFrontendUrl: new URL('/tenant/', window.location.origin).href,
  assetsManagerFrontendUrl: new URL('/asset-manager/', window.location.origin).href,
  usersFrontendUrl: new URL('/user/', window.location.origin).href,
  maintenanceServiceUrl: new URL('/service/maintenance', window.location.origin).href,
  hubFrontendUrl: new URL('/hub/', window.location.origin).href,
};
