import { Logger } from '@elunic/logger';
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';

import { ConfigService } from '../../config/config.service';
import { AbstractMachineDataWriter } from './abstract-machine-data-writer';

export class InfluxDbMachineDataWriter extends AbstractMachineDataWriter {
  private influxDB: InfluxDB;

  private influxWriteApi: WriteApi;

  constructor(private readonly logger: Logger, private readonly configService: ConfigService) {
    super();

    this.logger.info(`Connecting to InfluxDB at ${configService.influxdb.url} ...`);

    this.influxDB = new InfluxDB({
      url: configService.influxdb.url,
      token: configService.influxdb.token,
    });
    this.testConnection();

    this.influxWriteApi = this.influxDB.getWriteApi(
      configService.influxdb.organization,
      configService.influxdb.bucket,
      'ns',
    );
  }

  private testConnection() {
    setTimeout(async () => {
      const readApi = this.influxDB.getQueryApi(this.configService.influxdb.organization);
      readApi
        .queryRaw('buckets()')
        .then(() => {
          this.logger.info(`Successfully connected to ${this.configService.influxdb.url} ✅`);
        })
        .catch(_ => {
          this.logger.error(`Failed to connect to ${this.configService.influxdb.url}`);
        });
    }, 500);
  }

  async writePoint(
    measurement: string,
    value: number,
    tags: { [key: string]: number },
  ): Promise<void> {
    const point = new Point(measurement).floatField(`_value`, value);
    for (const [tagName, tagValue] of Object.entries(tags)) {
      point.tag(tagName, tagValue.toString());
    }

    try {
      this.influxWriteApi.writePoint(point);
      await this.influxWriteApi.flush(false);
    } catch (ex: any) {
      if (`${ex.message || ''}`.indexOf('ECONNREFUSED') > -1) {
        this.logger.error(`Cannot connect to InfluxDB: ${this.configService.influxdb.url}`);
        return;
      }

      throw ex;
    }
  }
}
