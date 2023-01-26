import { createLogger } from '@elunic/logger';
import { LoggerModule } from '@elunic/logger-nestjs';
import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoiPipeModule } from 'nestjs-joi';
import { getTypeOrmQueryDebuggingSetting, HttpExceptionFilter } from 'shared/nestjs';
import { LibModule } from 'shared/nestjs/lib.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { MIGRATION_PATH, MIGRATION_TABLE_NAME } from './definitions';
import { DocumentModule } from './document/document.module';
import { FileModule } from './file/file.module';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
// interface DynamicModuleOptions {}

@Module({
  imports: [FileModule, DocumentModule],
})
export class AppModule {
  static forApp(): DynamicModule {
    return this.buildDynamicModule({
      migrationsRun: true,
      enablePrometheus: true,
    });
  }

  static forE2E(): DynamicModule {
    return this.buildDynamicModule({});
  }

  // eslint-disable-next-line no-empty-pattern
  private static buildDynamicModule({
    dbName,
    migrationsRun,
    enablePrometheus,
  }: {
    dbName?: string;
    migrationsRun?: boolean;
    enablePrometheus?: boolean;
  }): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule,
        JoiPipeModule,
        LoggerModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            logger: createLogger(config.log.namespace, {
              consoleLevel: config.log.consoleLevel,
              json: false,
              logPath: undefined,
            }),
          }),
          inject: [ConfigService],
        }),

        TypeOrmModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            type: 'mysql',
            host: config.database.host,
            ssl: config.database.ssl,
            port: config.database.port,
            username: config.database.user,
            password: config.database.pass,
            database: dbName ? dbName : config.database.name,
            autoLoadEntities: true,
            migrationsTableName: MIGRATION_TABLE_NAME,
            migrations: [MIGRATION_PATH],
            namingStrategy: new SnakeNamingStrategy(),
            migrationsRun,
            ...getTypeOrmQueryDebuggingSetting(),
          }),
          inject: [ConfigService],
        }),

        LibModule.forRootAsync({
          enablePrometheus,
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            configService,
          }),
        }),
      ],
      providers: [
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,
        },
      ],
    };
  }
}
