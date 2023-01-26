import { Logger } from '@elunic/logger';
import { InfluxDB } from '@influxdata/influxdb-client';
import { OrgsAPI } from '@influxdata/influxdb-client-apis';
import { Injectable, NotImplementedException, OnModuleInit } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Connection, QueryFailedError } from 'typeorm';

import { ConfigService } from '../config/config.service';
import { DataSinkDto, SensorWithConfigDto, SinkConfig } from './device.dto';
import { DataSink } from './sources';

export interface MysqlGrafanaDataSource {
  name: string;
  type: 'mysql';
  access: 'proxy';
  url: string;
  user: string;
  database: string;
  jsonData: unknown;
  version: 1;
  secureJsonData: {
    password: string;
  };
  readOnly: true;
  isDefault: false;
}

const TASK_NAME = 'Archive device data';
const SECRET_NAME = 'MYSQL_CONNECTION_STRING';
// 2 years
const DEFAULT_RETENTION = 720 * 24;

@Injectable()
export class MysqlService extends DataSink<MysqlGrafanaDataSource> implements OnModuleInit {
  readonly type = 'mysql';
  readonly public = true;

  constructor(
    influxDb: InfluxDB,
    config: ConfigService,
    logger: Logger,
    private readonly connection: Connection,
  ) {
    super(influxDb, config, logger);
  }

  async onModuleInit() {
    await super.onModuleInit();

    const orgsApi = new OrgsAPI(this.influxDb);
    const secrets = await orgsApi.getOrgsIDSecrets({ orgID: this.orgId });
    if (!secrets.secrets?.includes(SECRET_NAME)) {
      const connStr = `${this.config.datalake.user}:${this.config.datalake.pass}@tcp(${this.config.datalake.host}:${this.config.datalake.port})/${this.config.datalake.name}`;
      await orgsApi.patchOrgsIDSecrets({ orgID: this.orgId, body: { [SECRET_NAME]: connStr } });
    }

    const exits = await this.taskExists(TASK_NAME);
    if (exits) {
      return;
    }
    this.logger.info('Creating InfluxDB to MySQL task');

    // A basic flux to copy series from the data lake bucket to the mysql database.
    const flux = `import "influxdata/influxdb/secrets"
import "sql"

option task = { name: "${TASK_NAME}", every: 1m, offset: 5s }

conn_str = secrets.get(key: "${SECRET_NAME}")

aggregateFn = (tables=<-, fn, fn_name) =>
    tables
    |> aggregateWindow(every: 5s, fn: fn)
    |> rename(columns: {_time: "time", deviceId: "device_id", parameterId: "parameter_id", _value: "value"})
    |> set(key: "aggregate", value: fn_name)
    |> set(key: "aggregate_interval", value: string(v: 5s))
    |> drop(columns: ["_start", "_stop", "_measurement", "_field"])
    |> group()
    |> map(fn: (r) => ({r with value: if exists r.value then float(v: r.value) else 0.0}))

data = from(bucket: "${this.config.influx.bucket}")
  |> range(start: -task.every)
  |> filter(fn: (r) => r["_measurement"] == "series" and r["_field"] == "value")

d1 = data
  |> aggregateFn(fn: mean, fn_name: "mean")

d2 = data
  |> aggregateFn(fn: min, fn_name: "min")

d3 = data
  |> aggregateFn(fn: max, fn_name: "max")

d4 = data
  |> aggregateFn(fn: sum, fn_name: "sum")

d5 = data
  |> aggregateFn(fn: count, fn_name: "count")
  |> map(fn: (r) => ({r with value: float(v: r.value)}))

d6 = data
  |> aggregateFn(fn: last, fn_name: "last")

union(tables: [d1, d2, d3, d4, d5, d6])
  |> sql.to(driverName: "mysql", dataSourceName: "\${conn_str}", table: "series")`;

    await this.createTask(flux);
  }

  async connect(sink: DataSinkDto, sensor: SensorWithConfigDto): Promise<void> {
    throw new NotImplementedException('Connecting is not supported for MySQL sink');
  }

  async getGrafanaConfig(orgId: string, sinkIds: string[]): Promise<MysqlGrafanaDataSource> {
    this.logger.info(`Creating new Grafana config for org ${orgId}`);
    // TODO: Find a better way to create a user name.
    const user = `gfds_${orgId}`;
    const password = randomBytes(12).toString('hex');
    await this.connection.transaction(async entityManager => {
      await entityManager.query(
        `CREATE USER IF NOT EXISTS ${this.connection.driver.escape(
          user,
        )} IDENTIFIED BY '${password}';`,
      );
      for (const id of sinkIds) {
        await entityManager.query(
          `GRANT SELECT ON ${this.config.datalake.name}.${this.connection.driver.escape(
            id,
          )} TO ?@'%';`,
          [user],
        );
      }
    });
    this.logger.info(`Created user ${user} and granted privileges`);

    const hostSegments = this.config.datalake.host.split('.');
    return {
      name: `MySQL`,
      type: 'mysql',
      access: 'proxy',
      url: `${this.config.datalake.host}:${this.config.database.port}`,
      user: hostSegments.length > 1 ? `${user}@${hostSegments[0]}` : user,
      database: this.config.datalake.name,
      jsonData: {},
      version: 1,
      secureJsonData: { password },
      readOnly: true,
      isDefault: false,
    };
  }

  async updateGrafanaConfig(orgId: string, sinkIds: string[]): Promise<undefined> {
    this.logger.info(
      `Updating Grafana config for org ${orgId}, adding permission for ${sinkIds.length} views`,
    );

    const user = `gfds_${orgId}`;
    await this.connection.transaction(async entityManager => {
      try {
        await entityManager.query(`REVOKE SELECT ON ${this.config.datalake.name}.* FROM ?@'%';`, [
          user,
        ]);
      } catch (e) {
        if (e instanceof QueryFailedError && e.message.includes('ER_NONEXISTING_GRANT')) {
          // Ignore this error
        } else {
          throw e;
        }
      }

      for (const id of sinkIds) {
        await entityManager.query(
          `GRANT SELECT ON ${this.config.datalake.name}.${this.connection.driver.escape(
            id,
          )} TO ?@'%';`,
          [user],
        );
      }
    });
    this.logger.info(`User ${user} privileges updated`);

    return undefined;
  }

  async createSink(deviceId: string, config: SinkConfig): Promise<DataSinkDto & SinkConfig> {
    const retentionHours = config.retention ? config.retention : DEFAULT_RETENTION;
    const tableName = 'series_' + deviceId;
    const eventName = config.retention
      ? `series_retention_${deviceId}_${retentionHours}hours`
      : `default_series_retention_${deviceId}`;

    this.logger.info(`Creating view ${tableName} and adding retention job ${eventName}`);

    await this.connection.transaction(async entityManager => {
      await entityManager.query(
        `CREATE VIEW ${this.connection.driver.escape(
          tableName,
        )} AS SELECT time, parameter_id, aggregate, aggregate_interval, value, unit FROM series WHERE device_id = ?;`,
        [deviceId],
      );
      await entityManager.query(
        `CREATE EVENT ${this.connection.driver.escape(
          eventName,
        )} ON SCHEDULE EVERY 1 DAY STARTS NOW() DO DELETE FROM series WHERE device_id = ? AND TIMESTAMPDIFF(HOUR, NOW(), time) >= ?;`,
        [deviceId, retentionHours],
      );
    });

    this.logger.info(`View ${tableName} created`);

    return {
      id: tableName,
      name: tableName,
      type: this.type,
      deviceId,
      config: {},
    };
  }

  async cascade(source: DataSinkDto, sink: DataSinkDto, interval: number): Promise<void> {}
}
