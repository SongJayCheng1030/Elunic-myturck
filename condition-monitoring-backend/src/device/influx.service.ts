import { Logger } from '@elunic/logger';
import { InfluxDB } from '@influxdata/influxdb-client';
import {
  AuthorizationsAPI,
  Bucket,
  BucketsAPI,
  Permission,
} from '@influxdata/influxdb-client-apis';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as moment from 'moment';

import { ConfigService } from '../config/config.service';
import { DataSinkDto, SensorDto, SensorType, SensorWithConfigDto, SinkConfig } from './device.dto';
import { DataSink, DeviceSource } from './sources';

export interface InfluxGrafanaDataSource {
  name: string;
  type: 'influxdb';
  access: 'proxy';
  url: string;
  jsonData: {
    httpMode: 'POST';
    organization: string;
    version: 'Flux';
  };
  secureJsonData: { token: string };
  readOnly: true;
  isDefault: false;
}

// 2 weeks
const DEFAULT_RETENTION = 14 * 24 * 3600;

@Injectable()
export class InfluxService extends DataSink<InfluxGrafanaDataSource> implements DeviceSource {
  readonly type = 'influxdb';
  readonly public = false;

  private bucketsApi = new BucketsAPI(this.influxDb);
  private authApi = new AuthorizationsAPI(this.influxDb);
  private queryApi = this.influxDb.getQueryApi(this.config.influx.org);

  constructor(influxDb: InfluxDB, config: ConfigService, logger: Logger) {
    super(influxDb, config, logger);
  }

  async getAvailableDeviceIds(): Promise<string[]> {
    const rows = await this.queryApi
      .collectRows<{ _value: string }>(
        `
        import "influxdata/influxdb/schema"

        schema.tagValues(bucket: "shopfloor", tag: "deviceId")
      `,
      )
      .catch(() => [] as Array<{ _value: string }>);

    return rows.map(r => r._value);
  }

  async getAvailableSensors(deviceId: string): Promise<SensorDto[]> {
    // TODO: Later we query the other measurements too to get other sensor types.
    const rows = await this.queryApi
      .collectRows<{ _value: string }>(
        `
        import "influxdata/influxdb/schema"

        schema.tagValues(bucket: "${this.config.influx.bucket}", tag: "parameterId", predicate: (r) => r._measurement == "series" and r.deviceId == "${deviceId}")
      `,
      )
      .catch(() => [] as Array<{ _value: string }>);

    return rows.map(row => ({ id: row._value, type: SensorType.SERIES }));
  }

  async getAvailableGroupIds(): Promise<string[]> {
    return [];
  }

  async connect(sink: DataSinkDto, sensor: SensorWithConfigDto): Promise<void> {
    // TODO: sanitize
    const taskName = `Stream ${sensor.id} (Device ${sink.deviceId})`;

    this.logger.info(`Creating connecting task ${taskName}`);

    // A basic flux to copy series from the data lake bucket to a device bucket.
    const flux = `option task = { name: "${taskName}", every: 1m, offset: 5s }

fromBucket = "${this.config.influx.bucket}"
toBucket = "${sink.name}"
deviceId = "${sink.deviceId}"
parameterId = "${sensor.id}"

from(bucket: fromBucket)
  |> range(start: -task.every)
  |> filter(fn: (r) => (r["_measurement"] == "series"))
  |> filter(fn: (r) => (r["_field"] == "value"))
  |> filter(fn: (r) => (r["deviceId"] == deviceId))
  |> filter(fn: (r) => (r["parameterId"] == parameterId))
  |> to(bucket: toBucket)`;

    await this.createTask(flux);
  }

  async getGrafanaConfig(orgId: string, bucketIds: string[]): Promise<InfluxGrafanaDataSource> {
    if (!bucketIds.length) {
      throw new InternalServerErrorException(`Must provide at least one bucket`);
    }

    const token = await this.createBucketToken(
      `Grafana token org ${orgId}`,
      bucketIds.map(id => ({ action: 'read', resource: { type: 'buckets', id } })),
    );

    return {
      name: `InfluxDB`,
      type: 'influxdb',
      access: 'proxy',
      url: this.config.influx.url,
      jsonData: {
        httpMode: 'POST',
        organization: this.orgId,
        version: 'Flux',
      },
      secureJsonData: { token },
      readOnly: true,
      isDefault: false,
    };
  }

  async updateGrafanaConfig(
    orgId: string,
    bucketIds: string[],
  ): Promise<InfluxGrafanaDataSource | undefined> {
    const tokens = await this.authApi.getAuthorizations({});
    const token = tokens.authorizations?.find(t => t.description === `Grafana token org ${orgId}`);
    if (token) {
      this.logger.info(`Removing existing token for org ${orgId}`);
      await this.authApi.deleteAuthorizationsID({ authID: token.id as string });
    }
    if (!bucketIds.length) {
      return undefined;
    }

    return this.getGrafanaConfig(orgId, bucketIds);
  }

  async createSink(deviceId: string, config: SinkConfig): Promise<DataSinkDto & SinkConfig> {
    const name = config.retention ? `${deviceId}|${config.retention}` : deviceId;
    const everySeconds = config.retention
      ? moment.duration(config.retention, 'hours').as('seconds')
      : DEFAULT_RETENTION;

    let bucket = await this.findBucket(name);
    if (!bucket) {
      this.logger.info(`Creating bucket ${name} with retention ${everySeconds}s`);
      bucket = await this.bucketsApi.postBuckets({
        body: {
          name,
          orgID: this.orgId,
          retentionRules: [
            {
              everySeconds,
              type: 'expire',
              // shardGroupDurationSeconds
            },
          ],
        },
      });
    }

    const retention = bucket.retentionRules[0].everySeconds;

    const token = await this.createBucketToken(`Device token ${deviceId}`, [
      {
        action: 'read',
        resource: { type: 'buckets', id: bucket.id },
      },
    ]);

    return {
      id: bucket.id as string,
      name: bucket.name,
      type: this.type,
      deviceId,
      retention,
      config: { token },
    };
  }

  async cascade(source: DataSinkDto, sink: DataSinkDto, interval: number): Promise<void> {
    const taskName = `Aggregate ${source.id} to ${sink.name}`;

    this.logger.info(`Creating cascading task ${taskName} for bucket ${sink.name}`);

    const flux = `option task = { name: "${taskName}", every: ${interval}s }

    fromBucket = "${source.id}"
    toBucket = "${sink.name}"
    deviceId = "${source.deviceId}"

    from(bucket: fromBucket)
      |> range(start: -task.every)
      |> filter(fn: (r) => (r["_measurement"] == "series"))
      |> filter(fn: (r) => (r["_field"] == "value"))
      |> filter(fn: (r) => (r["deviceId"] == deviceId))
      |> aggregateWindow(every: task.every, fn: mean)
      |> to(bucket: toBucket)`;

    await this.createTask(flux);
  }

  private async findBucket(name: string) {
    const { buckets } = await this.bucketsApi.getBuckets({ name });
    return buckets?.find(b => b.name === name && this.isPublicBucket(b));
  }

  private isPublicBucket(bucket: Bucket) {
    // System and default buckets
    return bucket.type !== 'system' && bucket.name !== this.config.influx.bucket;
  }

  private async createBucketToken(name: string, permissions: Permission[]): Promise<string> {
    this.logger.info(`Creating token for org ${this.orgId} with ${permissions.length} permission`);
    const auth = await this.authApi.postAuthorizations({
      body: {
        description: name,
        orgID: this.orgId,
        permissions: permissions.map(p => ({ ...p, orgID: this.orgId })),
      },
    });
    return auth.token as string;
  }
}
