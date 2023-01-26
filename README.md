<img src="docs/static/img/sio-logo.png" align="right" alt="shopfloor.io" width="48" height="48">

# shopfloor.io

This is the main repository containing the entire sources for all backends and frontends of the shopfloor.io IIoT application suite.

## 🏗️ Development

// TODO initialize Keycloak with the correct realm settings
Keycloak will be initialized with users and settings, but `identity-backend` needs to to be given more rights.

1. Start the dockershell s keycloak is running
2. log into [Keycloak](#Keycloak) admin console
3. Navigate to `Configure` -> `Clients`
4. choose `shopfloor-identity-backend`
5. select the tab `Service Account Roles`
6. In the `Client Roles` select `realm-management`
7. Add all `Available Roles` to the `Assigned Roles`

Now you can startup everything by running `npm i`, `npm run ia` and `npm run dev`.

## 🏗️ Development of User- or Tenant-Management

If you receive 400 error messages from `identity-backend` because the tenant and user id in the `local-dev-mock-token.ts`-file doesn't match any users in your local keycloak.

1. Create a new tenant through `tenant-frontend` (can be skipped if already done)
2. Log into keycloak (localhost:8000) (user: admin, PW: admin)
3. Select the shopfloor-dev realm
4. Navigate to the user tab and show all users
5. Select a user and get its userID (from the URL for example) store it somewhere
6. Go to the groups tab and find the created tenant (Group name start with `tenant-<tenant-ID>`)
7. Get the tenant-ID and store it somewhere
8. go to shared/nestjs/src/auth/local-dev-mock-token.ts replace the tenantId with the tenant ID and the sub with the userID in the mocked auth object

### 🥇 Checklist for new services/frontends

When adding new services or frontends the following steps need to be taken (possible more, the list is not yet complete):

 1. Register a new port for your service / frontend:
    1. Select a new port for the correct range based on the table below
    2. If backend service: add your port to `_fixtures/sio-ports.json`
    3. Run `npm run generate:sio-port-config` to re-generate the configuration, e.g. `proxy.conf.json`
    4. Extend the table inside this document `README.md` to document your selection
    5. Extend the section "Service environment variables for inter-service communication" in this `README.md` with the port if applicable (backend)
 2. extend the `docker-compose.shell.yml` with the newly defined service, specific service env var and port _OR_ the frontend config (if frontend)

### ✨ Port & path definitions

All backends and frontend apps are configured to run, inside the local dev environment, in the port project specific range of `13000 - 130xx` for the backends and `13100 - 131xx` for the frontends (project specific to prevent conflicts). 

The paths of the different services and frontends are fixed for online- / production systems as well as for local development to enable the usage of the `proxy.conf.json` of Angular. The following naming patterns apply:

 - `/service/[NAME-OF-SERVICE]/*` for services
 - `/[NAME-OF-ANGULAR-APP]/*` for frontends

The frontends utilize for this the built-in Angular reverse proxy by specifiying inside the `proxy.conf.json` the path mapping of the production-/online-system path to the assigned ports; the backends communicate directly agains the assigned ports of the other backends. This allows that frontends can use on the local dev environment as well as in the final prod system the same resolution method to build an URL to a backend: here for example the asset tree fetch:

```javascript
  window.location.origin + '/service/' + nameOfService + '/v1/tree' 
```  

For local dev this resolves to `http://localhost:13100/service/asset/v1/tree` (we are in the asset frontend) and is forwarded by the Angular `proxy.conf.json` to `http://localhost:13001/v1/tree`. Therfore no different handling code is required, greatly simplifying this part of the apps.

**The following services/backends/frontends are defined:**

__Backends:__

| Name | Assigned Port | Path | Description | Env var name
| --- | --- | --- | --- | --- |
| asset-manager-backend         | `13001` | `/service/asset/*`                | The asset manager backend service | `APP_PORT_ASSET`
| condition-monitoring-backend  | `13002` | `/service/condition-monitoring/*` | Backend service for condition-monitoring-based services: OEE monitoring, alarm management, ... | `APP_PORT_CONDITION_MONITORING`
| file-backend                   | `13003` | `/service/file/*`                 | File service for handling filees | `APP_PORT_FILE`
| hub-backend                   | `13004` | `/service/hub/*`                  | Hub backend service for providing data of the different applications | `APP_PORT_HUB`
| maintenance-backend           | `13005` | `/service/maintenance/*`          | Backend service of the maintenance manager  | `APP_PORT_MAINTENANCE`
| tenant-backend                | `13006` | `/service/tenant/*`               | Tenant management backend service | `APP_PORT_TENANT`
| identity-backend              | `13007` | `/service/identity/*`             | Backend service for handling everything around users | `APP_PORT_IDENTITY`

Remarks:
  - besides the specific env variables for every service to configure the port, all service are also checking `APP_PORT` (intended for deployment purposes) with higher precedence than the specific env var
  - if not in `NODE_ENV === "development"`, the default port is `8080` (for deployment purposes)

__Frontends:__

| Name | Assigned Port | Path | Description |
| --- | --- | --- | --- |
| asset-manager-frontend            | `13102` | `/asset-manager/*` | The asset manager frontend |
| asset-monitoring-frontend         | `13103` | `/asset-monitoring/*` | Overview frontend which give a read-only overview over all assets and related data |
| condition-monitoring-frontend     | `13104` | `/condition-monitoring/*` | Condition monitoring frontend which actually contains different "facades": Grafana dashboarding, OEE monitoring, ... |
| document-frontend                 | `13105` | `/documents/*` | Document management frontend |
| hub-frontend                      | `13106` | `/hub/*` | Main landing point for users: the SIO Hub used to provide links to the different apps |
| maintenance-frontend              | `13107` | `/maintenance/*` | Maintenance manager application |
| tenant-frontend                   | `13108` | `/tenant/*` | Tenant management user interface |
| user-frontend                     | `13109` | `/user/*` | User interface to manage users of the current tenant |
| support-frontend                  | `13111` | `/support/*` | Frontend for support |


### ✨ Naming conventions

 - (Directory) Folders in the root directory of this repo represent either a frontend, a backend or a folder containing other resources (utilities, documentation, ...) 
 - Frontend folders, containing one Angular frontend application, are named `[NAME_OF_BACKEND_OR_FRONTEND]-fronted`
 - Backend folders, containing one microservice, are named `[NAME_OF_BACKEND_OR_FRONTEND]-backend`

### 🐥 (Angular) Frontend development

__Important notice:__ as of writing this (2022-03-29) the current frontends are being migrated into the `shopfloorio-frontends/` workspace folder and not all frontends are yet migrated. Keep this in mind!

The folder `shopfloorio-frontends/` contains an [Angular Workspace (see official docs)](https://angular.io/guide/file-structure#setting-up-for-a-multi-project-workspace) which contains all Shopfloor.io frontend applications. Therefore only one set of frontend `node_modules` is required and installed in this folders; all frontends run from this modules greatly reducing size and complexity.

See the subfolder `shopfloorio-frontends/projects` for the following contents:

 - `app-...`, e.g. _app-asset-manager_, is a regular Shopfloor.io frontend application like - in this example - the asset manager. This frontend might have one or more backend service
 - `sio-common` is the common library shared across all Angular frontends with native [Angular workspace means](https://angular.io/guide/file-structure#library-project-files)

To start a frontend see `shopfloorio-frontends/package.json`, section `scripts`. For all frontends there are scripts to start available, e.g.

 - `npm run dev:app-asset-manager` to run the asset manager frontend
 - `npm run build:app-asset-manager` to build the asset manager frontend

The port defintions and `proxy.conf.json` settings remain the same as previously specified.

### 🏗️ Adding a new Angular app

To create a new app the following steps need to be taken:

  1. Go into the frontend apps folder `shopfloorio-frontends`
  2. Run `ng generate application MY_APP_NAME` where `MY_APP_NAME` has the prefix `app-` or `demo-` as specified in section _"🐥 (Angular) Frontend development"_
  3. Adapt the `shopfloorio-frontends/angular.json`: 
     1. Extend the `configuration.production.budgets` section of the new app entry within `angular.json`:
        ```
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "4200kb",
              "maximumError": "8400kb"
            },
            {
              "type": "anyComponentStyle",
              "maximumWarning": "42kb",
              "maximumError": "84kb"
            }
          ],
        ```
     2. Add the CSS library files __twice__ under `architect.build` and `architect.test` of the new app entry withing `angular.json`:
        ```
          "stylePreprocessorOptions": {
            "includePaths": [
              "./projects/sio-common/src/styles",
              "./projects/sio-common/src/styles/abstracts",
              "./node_modules/bootstrap/scss/mixins",
              "./node_modules/bootstrap/scss"
            ]
          }
        ```
  4. Extend the `package.json` with a new start script (commonly named `dev:MY_APP_NAME`) and a build script like for the other apps.
  5. Add inside `main.ts` in your new Angular app the snippet to set the environment:
    ```
      // Set the environment as global window variable
      // (see EnvironmentService in sio-common)
      (window as any).environment = environment;
    ```
  6. Extend the `.gitlab-ci.yml` based on the examples of the other apps to allow the pipeline to build the new app.
  7. Done. Happy coding!

### ⛩️ Debugging

#### Debugging database (issues)

The following information applies to local debugging as well as online debugging. For local debugging, extend the `.env` file inside the backend root (not this project root). In online debugging, extend the docker-compose stack or K8S deployment with the environment variables.

The following environment variables are available for debugging:

 - set `LOG_TYPEORM_QUERIES=1` to enable query logging. This will cause TypeORM to log all executed queries
 - set `LOG_TYPEORM_ALL=1` to enable full debugging of TypeORM. This causes TypeORM to log _everything_. Be aware: this can be a lot of log output!

Every service using a database accepts these settings.

### 🏓 Deployment

#### 🔌 Service environment variables for inter-service communication

To allow for services to communicate between each other an inter-service communication is required. For this the correct URLs need to be provisioned to every service so that they can connect to a required "foreign" service. The env vars are listed and maintained inside the file `_fixtures/sio-ports.json`. Thus, after adding or removing a new service, the script `npm run generate:sio-port-config` needs to be executed to update the configuration inside the code.

The following env vars should be configured with imaginary example endpoints:

```
    APP_SERVICE_URL_ASSET                 = "http://asset-manager-backend.{INSERT_NAMESPACE_HERE}.svc.cluster.local/"
    APP_SERVICE_URL_CONDITION_MONITORING  = "http://condition-monitoring-backend.{INSERT_NAMESPACE_HERE}.svc.cluster.local/"
    APP_SERVICE_URL_FILE                  = "http://file-backend.{INSERT_NAMESPACE_HERE}.svc.cluster.local/"
    APP_SERVICE_URL_HUB                   = "http://hub-backend.{INSERT_NAMESPACE_HERE}.svc.cluster.local/"
    APP_SERVICE_URL_IDENTITY              = "http://identity-backend.{INSERT_NAMESPACE_HERE}.svc.cluster.local/"
    APP_SERVICE_URL_MAINTENANCE           = "http://maintenance-backend.{INSERT_NAMESPACE_HERE}.svc.cluster.local/" 
```

It is recommended to create a ConfigMap in K8S clusters and add all those env vars and reference this ConfigMap in every service which simplifies changes.

No further actions need to be performed from a DevOps perspective.

**Local development:** due to the port range definition and service port assignment (see "✨ Port & path definitions") _no further configuration_ is required. By using the shared services in `shared/nestjs/src/services` the URLs of foreign services will be automatically resolved to the correct address. If debug level `DEBUG` is set the resolved URL will also be printed in the stdout for debugging purposes.

### 🧪 Testing

#### ⚙️ E2E 


E2E tests for myTurck project are written in [Cypress test framework](https://www.cypress.io/) in combination with [qase.io ](https://qase.io/) integration.
Currently, e2e tests are set to run on testing environment and they are executed on daily base, each night. Report after each execution can be found in qase dashboard under this [link](https://app.qase.io/run/MTR).

Test files are located under `test/e2e/` folder withing myTurck mono repository. All cypress configuration can be founder under `cypress.config.ts` file which is main file to control of Cypress framework.

In order to run all test in headless mode, following command needs to be executed.  

`npm run test`

By default all tests are running in Chrome browser but if we pass `--browser` variable with desired browser name, test can be executed in other browser, for example: `npm run test -- --browser=firefox`. 


Cypress framework provides dashboard feature. The Cypress Dashboard increases test velocity while giving total visibility into tests running in your CI pipeline allow easier debugging. In order to open dashboard, please run following command: 

`npm run dashboard`


⚠️ Cypress dashboard is not working in headless mode.


----

_🚧 🚧 The following content needs to be checked and possibly re-written (in progress)._

# Dockershell

## Keycloak

Keycloak is auto-configured on startup. You can make changes to the configuration as you see fit. Note that these will be lost in case the Docker volume is deleted. See below for how to wipe all changes to the default configuration and how to update the auto-configuration file with your changes.

### Important note on the Keycloak host

**All links below assume Keycloak is running on `localhost` (e.g. WSL2) as opposed to a VM. If this is not the case, replace `localhost` with your IP in the links below.**

### Admin interface

* URL: `http://localhost:8000/`
* Username: `admin`
* Password: `admin`

### Preconfigured IdP data: realm / users / clients

A `shopfloor-dev` realm is preconfigured:
* OpenID configuration URL: http://localhost:8000/auth/realms/shopfloor-dev/.well-known/openid-configuration

Preconfigured **users**:
* `shopfloor-admin`
  * Has the `Shopfloor Admin` role
  * Password: `shopfloor-admin`
  * Email: `admin@shopfloor-dev.local`
* `shopfloor-user`
  * Has the `Shopfloor User` role
  * Password: `shopfloor-user`
  * Email: `user@shopfloor-dev.local`

A `shopfloor-dev-oidc` **OpenID Connect** client is preconfigured:
* Client ID: `shopfloor-dev-oidc`
* Client Secret: `be920118-f70b-43a7-b681-7b6dae39ff72`
* Valid redirect URLs/CORS origins: `http(s)://*:*/*`
* Enabled flows:
  * Standard Flow (Authorization Code)
  * Implicit Flow
  * Direct Access Grants
* User roles are added to the `resource_access.shopfloor-dev-oidc.roles` array.

### Import configuration file

The configuration file is imported automatically when the container starts and the data volume is new/empty. On subsequent runs, the data volume will contain data and Keycloak will not import the configuration export again.

To wipe the data volume so that the exported configuration is imported on the next start:
* **Stop the Dockershell**
* Run `docker volume rm shopfloorio_keycloak_data`
* Restart the Dockershell

### Export current configuration

**WARNING: exporting configuration with the following command will overwrite the previous exported realm configuration file with a new one, containing all the changes you've made compared to the previous export. Once you commit the new file, everbody else will have their Keycloak configured in that way. DON'T MESS WITH THE CONFIGURATION UNLESS YOU KNOW WHAT YOU ARE DOING.**

**! Stop the Dockershell first !**

Run:
```shell
docker-compose -f docker-compose.shell.yml run --rm -v "$(pwd)/_fixtures/dockershell/keycloak/:/tmp/export/" --entrypoint /opt/jboss/keycloak/bin/standalone.sh keycloak -Djboss.bind.address.private=127.0.0.1 -Djboss.bind.address=0.0.0.0 -Dkeycloak.migration.action=export -Dkeycloak.migration.provider=singleFile -Dkeycloak.migration.file=/tmp/export/realm-import.json -Dkeycloak.migration.usersExportStrategy=REALM_FILE -Dkeycloak.migration.realmName=shopfloor-dev
```

This will start Keycloak and run the export after startup. The command will not exit automatically. It is recommended to leave it running for an appropriate amount time to be certain the export has run. Generally, one of the last lines indicating that startup is complete is something like `Admin console listening on http://127.0.0.1:9990`. This also means the export has completed (to be certain, you can look for the line `Exporting realm 'shopfloor-dev' into file ...` in the log).

At which point you can exit with `CTRL-C`.
