import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { BucketsAPI, OrgsAPI } from '@influxdata/influxdb-client-apis';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as NodeCache from 'node-cache';

import { ConfigService } from '../../config/config.service';
import { coerceBoolean } from '../model';

interface ColumnBase {
  name: string;
  value?: string | number | boolean;
}

interface TagColumn extends ColumnBase {
  isIndex: true;
}

interface FieldColumn extends ColumnBase {
  type: 'int' | 'float' | 'string' | 'boolean';
}

function isTagColumn(column: Column): column is TagColumn {
  return 'isIndex' in column && column.isIndex === true;
}

export type Measurement = 'log' | 'switch' | 'series';

export interface InfluxOptions {
  url: string;
  username?: string;
  password?: string;
  database: string;
  retentionPolicy: string;
}

export interface CreatePointOptions {
  parameterId: string;
  deviceId: string;
  timestamp: Date;
  measurement: Measurement;
}

export type Column = TagColumn | FieldColumn;

@Injectable({ scope: 0 })
export class DatabaseService implements OnModuleInit {
  private cache = new NodeCache({ stdTTL: 600, useClones: false });
  private influxDb = new InfluxDB({
    url: this.config.influx.url,
    token: this.config.influx.token,
  });
  private api = this.getWriteApi(this.config.influx.bucket);

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const orgsApi = new OrgsAPI(this.influxDb);
    const { orgs } = await orgsApi.getOrgs({ org: this.config.influx.org });
    const org = orgs?.find(o => o.name === this.config.influx.org);
    if (!org) {
      throw new Error('Org not found');
    }

    const bucketsApi = new BucketsAPI(this.influxDb);
    const { buckets } = await bucketsApi.getBuckets({ limit: 100 });

    buckets
      ?.filter(b => b.type !== 'system' && b.name !== this.config.influx.bucket)
      .forEach(b => this.cache.set(b.name, this.getWriteApi(b.name)));
  }

  writeMeasurementPoint(opts: CreatePointOptions, columns: Column[] | Column) {
    let point = new Point(opts.measurement)
      .timestamp(opts.timestamp)
      .tag('deviceId', opts.deviceId)
      .tag('parameterId', opts.parameterId)
      .stringField('receivedAt', new Date().toISOString());

    if (!Array.isArray(columns)) {
      columns = [columns];
    }

    columns.forEach(column => {
      if (column.value === undefined) {
        return;
      }

      if (isTagColumn(column)) {
        point = point.tag(column.name, String(column.value));
      } else {
        const { name, value, type } = column;
        switch (type) {
          case 'int':
            point = point.intField(name, Math.trunc(Number(value)));
            break;
          case 'float':
            point = point.floatField(name, Number(value));
            break;
          case 'string':
            point = point.stringField(name, String(value));
            break;
          case 'boolean':
            point = point.booleanField(name, coerceBoolean(value));
            break;
          default:
            throw Error('Unsupported data type: ' + type);
        }
      }
    });

    this.writePoint(point);
  }

  writePoint(point: Point) {
    // const api = await this.getInfluxWriteApi(bucket);
    this.api.writePoint(point);
  }

  // private getInfluxWriteApi(bucket: string): Promise<WriteApi> {
  //   const cachedApi = this.cache.get<Promise<WriteApi>>(bucket);
  //   if (!cachedApi) {
  //     const promise = new Promise<WriteApi>(async (res, rej) => {
  //       try {
  //         const bucketsApi = new BucketsAPI(this.influxDb);
  //         const { buckets } = await bucketsApi.getBuckets({ name: bucket });
  //         const found = buckets?.find(b => b.name === bucket);

  //         if (!found) {
  //           await bucketsApi.postBuckets({
  //             body: {
  //               name: bucket,
  //               orgID: this.orgId,
  //               retentionRules: [],
  //             },
  //           });
  //         }

  //         const api = this.getWriteApi(bucket);

  //         res(api);
  //       } catch (e) {
  //         this.cache.del(bucket);
  //         rej(e);
  //       }
  //     });

  //     this.cache.set(bucket, promise);

  //     return promise;
  //   }

  //   return cachedApi;
  // }

  private getWriteApi(bucket: string) {
    return this.influxDb.getWriteApi(this.config.influx.org, bucket, 'ns', {
      flushInterval: 10000,
    });
  }
}
