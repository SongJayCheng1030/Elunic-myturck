import { LogService } from '@elunic/logger';
import { getLoggerTokenFor, InjectLogger } from '@elunic/logger-nestjs';
import { Module } from '@nestjs/common';

import { ConfigService } from '../config/config.service';
import { C8yConnector, Connector, MqttConnector, SimulatorConnector } from './connectors';
import { TopicExtractor } from './model';
import { DatabaseService, SeriesService } from './services';

@Module({
  providers: [
    TopicExtractor,
    SeriesService,
    DatabaseService,
    {
      provide: Connector,
      useFactory: (config: ConfigService, logger: LogService) => {
        switch (config.adapter) {
          case 'c8y':
            return new C8yConnector(config, logger.createLogger(C8yConnector.name));
          case 'mqtt':
            return new MqttConnector(config, logger.createLogger(MqttConnector.name));
          case 'simulation':
            return new SimulatorConnector(config, logger.createLogger(SimulatorConnector.name));
          default:
            throw new Error('Unknown adapter');
        }
      },
      inject: [ConfigService, getLoggerTokenFor()],
    },
  ],
})
export class ListenerModule {
  // Required to make loggers injectable in the factory functions of this module.
  constructor(
    @InjectLogger() rootLog: LogService,
    config: ConfigService,
    seriesService: SeriesService,
    connector: Connector,
  ) {
    rootLog.info(`Using adapter: ${config.adapter}`);
    connector.addService(seriesService);
    connector.start();
  }
}
