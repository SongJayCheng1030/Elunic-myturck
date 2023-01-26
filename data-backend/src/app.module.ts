import createLogger from '@elunic/logger';
import { LoggerModule } from '@elunic/logger-nestjs';
import { DynamicModule, Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { ListenerModule } from './listener/listener.module';

@Module({})
export class AppModule {
  static forApp(): DynamicModule {
    return this.buildDynamicModule();
  }

  static forE2E(): DynamicModule {
    return this.buildDynamicModule();
  }

  private static buildDynamicModule(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule,
        LoggerModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            logger: createLogger(config.log.namespace, {
              consoleLevel: config.log.level,
              logPath: config.log.logPath,
            }),
          }),
          inject: [ConfigService],
        }),
        ListenerModule,
      ],
      providers: [],
      controllers: [],
      exports: [],
    };
  }
}
