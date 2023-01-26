# Shopfloor.IO Identity Backend

This backend provides identitiy functionality for the entire Shopfloor application environment. Namely it provides:

 - user functionality by utilizing Keycloak as a user backend and IdP
 - tenant functionality by utilizing Keycloak as well

## 🔌 Service environment variables

__Required:__

 - _MySQL datastorage access credentials:_
   - `APP_DB_HOST` - Either the hostname or IP address of the MySQL server
   - `APP_DB_PORT` - MySQL port. Default (every environment): `3306`
   - `APP_DB_USER` - Name of the user account, used to connect
   - `APP_DB_PASS` - Password of the user, used to connect
   - `APP_DB_NAME` - Name of the database to use
   - `APP_DB_SSL` - If MySQL should connect via SSL ("SSL mode require"). Default (every environment): `false`
 - _Keycloak credentials:_
   - `KEYCLOAK_REALM_NAME` - The name of the used realm
   - `KEYCLOAK_BASE_URL` - The base url of Keycloak from the perspective of this service (e.g. also internal), e.g. `http://localhost:8080/auth` (keep the `/auth` part at the end)
   - `KEYCLOAK_CLIENT_ID` - The Keycloak client id for the API client accessing Keycloak, e.g. the "name" like _"sio-identity-backend"_
   - `KEYCLOAK_CLIENT_SECRET` - The matching client secret for `APP_KEYCLOAK_CLIENT_ID`
 - `APP_HOSTNAME` - The hostname where the service is available from external, e.g. _"development.shopfloor.io"_

__Optional:__

 - `APP_PORT` - Port the service listens on. Default (on production): `8080`
   - `APP_PORT_IDENTITY` - Alternative name
   - _Please note: as per defition this service has a fixed port for development, see `REAMDE.md` in SIO project-root_
 - `LOG_LEVEL` - The loglevel to log messages. Default (every environment): `info`
 - `APP_USE_HTTPS` - If HTTPS should be used when URLs are constructed for redirects, default: `true`
