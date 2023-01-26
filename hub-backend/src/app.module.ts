import createLogger from '@elunic/logger';
import { LoggerModule } from '@elunic/logger-nestjs';
import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmQueryDebuggingSetting } from 'shared/nestjs';
import { LibModule } from 'shared/nestjs/lib.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { MIGRATION_PATH, MIGRATION_TABLE_NAME, TABLE_PREFIX } from './definitions';
import { GeneralSettingModule } from './general-setting/general-setting.module';
import { TenantMigrationCreateHubBackground002 } from './general-setting/tenant-migrations/002-create-hub-background';
import { TenantMigrationCreateInitialHubTiles001 } from './tile-configuration/tenant-migrations/001-create-initial-hub-tiles.service';
import { TileConfigurationModule } from './tile-configuration/tile-configuration.module';

@Module({})
export class AppModule {
  static forApp(): DynamicModule {
    return this.buildDynamicModule({
      migrationsRun: true,
    });
  }

  static forE2E(dbName: string): DynamicModule {
    return this.buildDynamicModule({
      dbName,
      migrationsRun: false,
    });
  }

  private static buildDynamicModule({
    dbName,
    migrationsRun,
  }: {
    dbName?: string;
    migrationsRun?: boolean;
  }): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule,

        LibModule.forRootAsync({
          enablePrometheus: true,
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            configService,
          }),
          tenantMigrations: [
            TenantMigrationCreateInitialHubTiles001,
            TenantMigrationCreateHubBackground002,
          ],
          tenantMigrationPrefix: TABLE_PREFIX,
        }),

        LoggerModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            logger: createLogger(config.log.namespace, {
              consoleLevel: config.log.level,
              logPath: undefined,
              json: false,
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
        TileConfigurationModule,
        GeneralSettingModule,
      ],
      providers: [],
      controllers: [],
      exports: [],
    };
  }
}
