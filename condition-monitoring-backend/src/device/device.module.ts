import { Client } from '@c8y/client';
import { LogService } from '@elunic/logger';
import { getLoggerTokenFor, InjectLogger } from '@elunic/logger-nestjs';
import { InfluxDB } from '@influxdata/influxdb-client';
import { Module } from '@nestjs/common';
import { getConnectionToken, TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { ConfigService } from '../config/config.service';
import { OrganizationEntity } from '../organization/organization.entity';
import { C8yDeviceService } from './c8y.service';
import { DataSinkEntity } from './data-sink.entity';
import { DeviceController } from './device.controller';
import { DeviceEntity } from './device.entity';
import { DeviceService } from './device.service';
import { InfluxService } from './influx.service';
import { MysqlService } from './mysql.service';
import { SensorEntity } from './sensor.entity';
import { DeviceSource } from './sources';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceEntity, SensorEntity, DataSinkEntity, OrganizationEntity]),
    TypeOrmModule.forFeature([], 'data_lake'),
  ],
  providers: [
    {
      provide: InfluxService,
      useFactory: async (config: ConfigService, logger: LogService) => {
        const { url, token } = config.influx;
        const influxDb = new InfluxDB({ url, token });
        return new InfluxService(influxDb, config, logger.createLogger(InfluxService.name));
      },
      inject: [ConfigService, getLoggerTokenFor()],
    },
    {
      provide: MysqlService,
      useFactory: async (config: ConfigService, logger: LogService, connection: Connection) => {
        const { url, token } = config.influx;
        const influxDb = new InfluxDB({ url, token });
        return new MysqlService(
          influxDb,
          config,
          logger.createLogger(MysqlService.name),
          connection,
        );
      },
      inject: [ConfigService, getLoggerTokenFor(), getConnectionToken('data_lake')],
    },
    {
      provide: C8yDeviceService,
      useFactory: async (config: ConfigService) => {
        const { user, password, baseUrl, disabled } = config.cumulocity;

        if (disabled) {
          return null;
        }

        const client = await Client.authenticate({ user, password }, baseUrl);
        return new C8yDeviceService(client);
      },
      inject: [ConfigService],
    },
    {
      provide: DeviceSource,
      useFactory: (influx: InfluxService, c8y: C8yDeviceService | null) => c8y || influx,
      inject: [InfluxService, C8yDeviceService],
    },
    {
      provide: 'DATA_SINKS',
      useFactory: (influx: InfluxService, mysql: MysqlService) => [influx, mysql],
      inject: [InfluxService, MysqlService],
    },
    DeviceService,
  ],
  controllers: [DeviceController],
  exports: [DeviceService],
})
export class DeviceModule {
  // Required to make loggers injectable in the factory functions of this module.
  constructor(@InjectLogger() rootLog: LogService) {}
}
