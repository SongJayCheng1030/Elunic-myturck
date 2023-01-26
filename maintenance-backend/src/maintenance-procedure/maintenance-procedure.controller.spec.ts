import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { StepType } from 'shared/common/models';
import { authMiddleware, ResponseInterceptor, SharedApiService } from 'shared/nestjs';
import { SharedAssetService } from 'shared/nestjs/services/shared-asset.service';
import { AppModule } from 'src/app.module';
import { createTestDatabase, dropTestDatabase, getTestConnectionOpts } from 'src/util/connection';
import * as request from 'supertest';
import { Connection, getConnection, Repository } from 'typeorm';

import { AuthInfo } from '../common/src/types';
import {
  CreateProcedureStepDto,
  ProcedureStepContentDto,
} from '../procedure-step/dto/procedure-step.dto';
import { CreateProcedureDto } from './dto/procedure.dto';
import { ProcedureEntity } from './entities/maintenance-procedure.entity';

describe('MaintenanceProcedureController', () => {
  let testDbName: string;
  let app: INestApplication;
  const opts = getTestConnectionOpts();
  let connection: Connection;
  let procedureRepo: Repository<ProcedureEntity>;
  let maintenances: ProcedureEntity[];
  const OLD_ENV = process.env;

  const mockGetAssetTypeById = jest
    .fn()
    .mockImplementation((auth: AuthInfo, assetTypeId: string) => ({ id: assetTypeId }));
  const mockSharedAssetService = { getTypeById: mockGetAssetTypeById };

  const mockSharedApiServiceGet = jest.fn().mockReturnValue({ data: { data: [] } });
  const mockSharedApiServicePost = jest.fn().mockReturnValue({ data: { data: [] } });
  const mockSharedApiService = {
    httpGetOrFail: mockSharedApiServiceGet,
    httpPostOrFail: mockSharedApiServicePost,
  };

  beforeAll(async () => {
    process.env = { ...OLD_ENV };
    process.env.APP_FORCE_MOCK_AUTH = '1';
    testDbName = await createTestDatabase(opts);

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule.forE2E(testDbName)],
    })
      .overrideProvider(SharedAssetService)
      .useValue(mockSharedAssetService)
      .overrideProvider(SharedApiService)
      .useValue(mockSharedApiService)
      .compile();

    connection = getConnection();
    procedureRepo = connection.getRepository(ProcedureEntity);

    app = moduleFixture.createNestApplication();
    authMiddleware(app);
    app.useGlobalInterceptors(new ResponseInterceptor());

    await app.init();
  }, 20000);

  afterAll(async () => {
    process.env = OLD_ENV;
    await app.close();
    await dropTestDatabase(testDbName, opts);
  });

  let insertedProcedure: ProcedureEntity;

  beforeEach(async () => {
    insertedProcedure = await procedureRepo.save({
      name: 'test',
      tenantId: '8e640e8c-12e2-4725-b16a-c6ba889c5fb1',
      description: 'test',
      assetTypeId: 'test',
      interval: 1,
      intervalUnit: 'days',
    });
    maintenances = await procedureRepo.find();
  });

  afterEach(async () => {
    await procedureRepo.delete({});
  });

  it('GET /procedures - return all work procedures in db and data in the right format', async () => {
    return request(app.getHttpServer())
      .get(`/procedures`)
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBe(maintenances.length);
      });
  });

  it('should return a dataresponse containing a single procedure', async () => {
    return request(app.getHttpServer())
      .get('/procedures/' + insertedProcedure.id)
      .expect(({ body }) => {
        expect(body.data.id).toBe(insertedProcedure.id);
        expect(body.data.name).toBe('test');
        expect(body.data.description).toBe('test');
      });
  });

  describe('create procedure', () => {
    const MOCK_IMAGE_ID = '507e6206-e71f-44ad-85d6-a01881f48332';

    const MOCK_CREATE_CONTENT: ProcedureStepContentDto = {
      images: [MOCK_IMAGE_ID],
      documents: [],
    };

    const MOCK_CREATE_STEP: CreateProcedureStepDto = {
      name: 'step-name',
      description: 'step-description',
      mandatory: true,
      skippable: false,
      type: StepType.DESCRIPTION,
      content: MOCK_CREATE_CONTENT,
    };

    const MOCK_CREATE_PROCEDURE: CreateProcedureDto = {
      name: 'test2',
      description: 'test',
      assetTypeId: 'db3f03da-120c-42ab-9d09-947220d3162e',
      interval: 2,
      intervalUnit: 'hours',
      steps: [MOCK_CREATE_STEP],
    };

    it('should create without a document', () => {
      return request(app.getHttpServer())
        .post(`/procedures`)
        .send(MOCK_CREATE_PROCEDURE)
        .expect(201)
        .expect(({ body }) => {
          const { data } = body;
          expect(data).toMatchObject({
            name: 'test2',
            description: 'test',
            assetTypeId: 'db3f03da-120c-42ab-9d09-947220d3162e',
            interval: 2,
            intervalUnit: 'hours',
          });
          expect(data.steps.length).toBe(1);
          expect(data.steps[0]).toMatchObject({
            ...MOCK_CREATE_STEP,
            content: { images: MOCK_CREATE_CONTENT.images },
          });
        });
    });

    it('should tell document service given a step with a document', () => {
      const MOCK_DOCUMENT_ID = `b613d84d-5a0e-44ee-bc44-cbd3d6860dfa`;
      const createProcedureWithDocuments: CreateProcedureDto = {
        ...MOCK_CREATE_PROCEDURE,
        steps: [
          {
            ...MOCK_CREATE_STEP,
            content: {
              images: [MOCK_IMAGE_ID],
              documents: [MOCK_DOCUMENT_ID],
            },
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/procedures`)
        .send(createProcedureWithDocuments)
        .expect(201)
        .expect(({ body }) => {
          const { data } = body;
          const { id: firstStepId } = body.data.steps[0];
          expect(mockSharedApiServicePost).toHaveBeenCalledWith(
            expect.any(Object),
            'fileServiceUrl',
            `/v1/documents/${MOCK_DOCUMENT_ID}/assign`,
            { refId: firstStepId, refType: 'maintenance_step' },
          );

          expect(data).toMatchObject({
            name: 'test2',
            description: 'test',
            assetTypeId: 'db3f03da-120c-42ab-9d09-947220d3162e',
            interval: 2,
            intervalUnit: 'hours',
          });
          expect(data.steps.length).toBe(1);
          expect(data.steps[0]).toMatchObject({
            ...MOCK_CREATE_STEP,
            content: { images: MOCK_CREATE_CONTENT.images },
          });
        });
    });
  });

  it('should delete one procedure', () =>
    request(app.getHttpServer())
      .delete(`/procedures/${insertedProcedure.id}`)
      .expect(200));
});
