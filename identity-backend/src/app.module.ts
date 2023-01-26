import createLogger from '@elunic/logger';
import { LoggerModule } from '@elunic/logger-nestjs';
import { DynamicModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoiPipeModule } from 'nestjs-joi';
import { getTypeOrmQueryDebuggingSetting, HttpExceptionFilter } from 'shared/nestjs';
import { LibModule } from 'shared/nestjs/lib.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { ENTITIES_PATH, MIGRATION_PATH, MIGRATION_TABLE_NAME } from './definitions';
import { KeycloakModule } from './keycloak/keycloak.module';
import { TenantModule } from './tenant/tenant.module';
import { TenantSettingsModule } from './tenant-settings/tenant-settings.module';
import { UserModule } from './user/user.module';

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
    migrationsRun,
  }: {
    dbName?: string;
    migrationsRun?: boolean;
  }): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule,

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
          // Don't forget to changes ormconfig.ts as well
          useFactory: (config: ConfigService) => ({
            type: 'mysql',
            host: config.database.host,
            ssl: config.database.ssl,
            port: config.database.port,
            username: config.database.user,
            password: config.database.pass,
            database: config.database.name,
            autoLoadEntities: true,
            migrationsTableName: MIGRATION_TABLE_NAME,
            migrations: [MIGRATION_PATH],
            namingStrategy: new SnakeNamingStrategy(),
            migrationsRun,
            entities: [ENTITIES_PATH],
            synchronize: false,
            keepConnectionAlive: true,
            ...getTypeOrmQueryDebuggingSetting(),
          }),
          inject: [ConfigService],
        }),
        JoiPipeModule,
        TenantModule,
        TenantSettingsModule,
        KeycloakModule,
        UserModule,
        LibModule.forRootAsync({
          enablePrometheus: true,
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            configService,
          }),
          authMiddlewareAllowNoTenants: [
            '/v1/tenants',
            '/v1/users/auth/tenant',
            '/v1/users/user/me',
          ],
        }),
      ],
      controllers: [],
      exports: [ConfigModule, TypeOrmModule],
      providers: [
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,
        },
      ],
    };
  }
}
