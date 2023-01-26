import createLogger from '@elunic/logger';
import { LoggerModule } from '@elunic/logger-nestjs';
import {
  DynamicModule,
  HttpModule,
  Injectable,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { NestMiddleware } from '@nestjs/common/interfaces';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { json } from 'body-parser';
import { Request, Response } from 'express';
import { JoiPipeModule } from 'nestjs-joi';
import { LibModule } from 'shared/nestjs/lib.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { DataModule } from './data/data.module';
import {
  DATALAKE_MIGRATION_PATH,
  DATALAKE_MIGRATION_TABLE_NAME,
  ENTITIES_PATHS,
  MIGRATION_PATH,
  MIGRATION_TABLE_NAME,
  TABLE_PREFIX,
} from './definitions';
import { DeviceModule } from './device/device.module';
import { FacadesModule } from './facades/facades.module';
import { TenantMigrationInitGfbsFacade003 } from './facades/tenant-migrations/003-init-gfbs-facade';
import { PdfGeneratorModule } from './generate-pdf/generate-pdf.module';
import { GrafanaBuildingsetModule } from './grafana-buildingset/grafana-buildingset.module';
import { GrafanaProxyModule } from './grafana-proxy/grafana-proxy.module';
import { MachineModule } from './machine/machine.module';
import { MachineAlertModule } from './machine-alert/machine-alert.module';
import { MachineVariableModule } from './machine-variable/machine-variable.module';
import { OrganizationModule } from './organization/organization.module';
import { TenantMigrationGrafanaOrganization004 } from './organization/tenant-migrations/004-grafana-organization.service';
import { SettingsModule } from './settings/settings.module';
import { TenantMigrationInitSettings001 } from './settings/tenant-migrations/001-init-settings.service';

@Module({})
export class AppModule implements NestModule {
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
      providers: [],
      controllers: [],
      exports: [],
      imports: [
        HttpModule,
        LibModule.forRootAsync({
          enablePrometheus: true,
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            configService,
          }),
          tenantMigrations: [
            TenantMigrationInitSettings001,
            TenantMigrationInitGfbsFacade003,
            TenantMigrationGrafanaOrganization004,
          ],
          tenantMigrationPrefix: TABLE_PREFIX,
          imports: [OrganizationModule],
        }),
        ConfigModule,
        MachineModule,
        MachineAlertModule,
        PdfGeneratorModule,
        MachineVariableModule,
        GrafanaBuildingsetModule,
        JoiPipeModule,
        FacadesModule,
        DataModule,
        DeviceModule,
        OrganizationModule,
        GrafanaProxyModule,
        ScheduleModule.forRoot(),
        LoggerModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            logger: createLogger(config.log.namespace, {
              consoleLevel: config.log.level,
              json: false,
              logPath: undefined,
            }),
          }),
          inject: [ConfigService],
        }),
        SettingsModule,
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
            entities: [...ENTITIES_PATHS],
            migrationsTableName: MIGRATION_TABLE_NAME,
            migrations: [MIGRATION_PATH],
            namingStrategy: new SnakeNamingStrategy(),
            migrationsRun,
            subscribers: [],
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forRootAsync({
          name: 'data_lake',
          useFactory: (config: ConfigService) => ({
            type: 'mysql',
            host: config.datalake.host,
            ssl: config.datalake.ssl,
            port: config.datalake.port,
            username: config.datalake.user,
            password: config.datalake.pass,
            database: dbName ? dbName : config.datalake.name,
            autoLoadEntities: true,
            entities: [],
            migrationsTableName: DATALAKE_MIGRATION_TABLE_NAME,
            migrations: [DATALAKE_MIGRATION_PATH],
            namingStrategy: new SnakeNamingStrategy(),
            migrationsRun,
            subscribers: [],
          }),
          inject: [ConfigService],
        }),
      ],
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(JsonBodyMiddleware)
      .exclude(
        {
          method: RequestMethod.ALL,
          path: 'v1/grafana',
        },
        {
          method: RequestMethod.ALL,
          path: 'v1/grafana/(.*)',
        },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

@Injectable()
export class JsonBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void): void {
    json()(req, res, next);
  }
}
