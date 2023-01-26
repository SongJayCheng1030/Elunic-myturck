import createLogger from '@elunic/logger';
import { LoggerModule } from '@elunic/logger-nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedApiService } from 'shared/nestjs';
import { LibModule } from 'shared/nestjs/lib.module';
import { ConfigService } from 'src/config/config.service';
import { createTestDatabase, dropTestDatabase, getTestConnectionOpts } from 'src/util/connection';
import { ConnectionOptions } from 'typeorm';

import { ConfigModule } from '../config/config.module';
import { ENTITIES_PATHS, MIGRATION_PATH } from '../definitions';
import { ProcedureLibraryStepEntity } from './entities/maintenance-procedure-library-step.entity';
import { StepTagEntity } from './entities/step-tag.entity';
import { ProcedureStepService } from './procedure-step.service';

describe('ProcedureStepService', () => {
  let service: ProcedureStepService;
  let testDbName: string;
  const opts = getTestConnectionOpts();

  beforeEach(async () => {
    testDbName = await createTestDatabase(opts);
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcedureStepService, SharedApiService],
      imports: [
        LibModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            configService,
          }),
          disableTenantMiddleware: true,
        }),
        ConfigModule,
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
        TypeOrmModule.forRoot({
          ...opts,
          database: testDbName,
          migrationsRun: true,
          entities: ENTITIES_PATHS,
          migrations: [MIGRATION_PATH],
        } as ConnectionOptions),
        TypeOrmModule.forFeature([ProcedureLibraryStepEntity, StepTagEntity]),
      ],
    }).compile();

    service = module.get<ProcedureStepService>(ProcedureStepService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(async () => {
    await dropTestDatabase(testDbName, opts);
  });
});
