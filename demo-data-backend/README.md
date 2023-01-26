# Shopfloor.IO Demo Data Generation Backend

This backend provides a sophisticated generator for demo data

## 🔌 Service environment variables

__Required:__

 - _MySQL datastorage access credentials:_
   - `APP_DB_HOST` - Either the hostname or IP address of the MySQL server
   - `APP_DB_PORT` - MySQL port. Default (every environment): `3306`
   - `APP_DB_USER` - Name of the user account, used to connect
   - `APP_DB_PASS` - Password of the user, used to connect
   - `APP_DB_NAME` - Name of the database to use
   - `APP_DB_SSL` - If MySQL should connect via SSL ("SSL mode require"). Default (every environment): `false`
 - InfluxDB 2 credentials:_
   - `INFLUXDB_URL` - URL to the influx db, e.g. `http://localhost:8086`
   - `INFLUX_TOKEN` - The token for the influx db
   - `INFLUX_BUCKET` - Bucket inside the influx db to connect to
   - `INFLUX_ORGANIZATION` - Organisation inside the influx db to use

__Optional:__

 - `APP_PORT` - Port the service listens on. Default (on production): `8080`
   - `APP_PORT_DEMO_DATA` - Alternative name
 - `LOG_LEVEL` - The loglevel to log messages. Default (every environment): `info`
## Usage

To start data generation run:

```
npm run maintenance:start-demo-data-generation
```

By default, data is written to the console. To write to InfluxDB, change this line:

```
const WRITER = new ConsoleMachineDataWriter();
```
to
```
const WRITER = new InfluxDbMachineDataWriter();
```
