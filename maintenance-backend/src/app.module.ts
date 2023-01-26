import createLogger from '@elunic/logger';
import { LoggerModule } from '@elunic/logger-nestjs';
import { ClassSerializerInterceptor, DynamicModule, HttpModule, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoiPipeModule } from 'nestjs-joi';
import { HttpExceptionFilter, ResponseInterceptor, TypeormExceptionFilter } from 'shared/nestjs';
import { LibModule } from 'shared/nestjs/lib.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { AssetAssignmentController } from './asset-assignment/asset-assignment.controller';
import { AssetAssignmentModule } from './asset-assignment/asset-assignment.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { ENTITIES_PATHS, MIGRATION_PATH, MIGRATION_TABLE_NAME } from './definitions';
import { ExecutionModule } from './maintenance-execution/maintenance-execution.module';
import { ProcedureModule } from './maintenance-procedure/maintenance-procedure.module';
import { ProcedureStepModule } from './procedure-step/procedure-step.module';

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
      migrationsRun: true,
      disableTenantMiddleware: true,
    });
  }

  private static buildDynamicModule({
    dbName,
    migrationsRun,
    disableTenantMiddleware = false,
  }: {
    dbName?: string;
    migrationsRun?: boolean;
    disableTenantMiddleware?: boolean;
  }): DynamicModule {
    return {
      module: AppModule,
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: ResponseInterceptor,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: ClassSerializerInterceptor,
        },
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,
        },
        {
          provide: APP_FILTER,
          useClass: TypeormExceptionFilter,
        },
      ],
      controllers: [AssetAssignmentController],
      exports: [],
      imports: [
        HttpModule,
        ConfigModule,
        JoiPipeModule,
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

        LibModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            configService,
          }),
          disableTenantMiddleware,
        }),

        AssetAssignmentModule,
        ExecutionModule,
        ProcedureModule,
        ProcedureStepModule,
        ScheduleModule.forRoot(),
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
      ],
    };
  }
}
