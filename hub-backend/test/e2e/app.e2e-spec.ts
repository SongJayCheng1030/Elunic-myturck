import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authMiddleware } from 'shared/nestjs';
import * as request from 'supertest';
import { TestDb } from 'test/e2e/util/TestDb';
import { Connection, getConnectionManager } from 'typeorm';

import { AppModule } from '../../src/app.module';
import { ConfigService } from '../../src/config/config.service';

describe('General settings (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let testDb: TestDb;
  TestDb.setup(new ConfigService(), t => (testDb = t));

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule.forE2E(testDb.dbName)],
    }).compile();

    connection = getConnectionManager().get('default');

    app = moduleFixture.createNestApplication();
    authMiddleware(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET general settings', () => {
    it('should get a list of general settings', async () => {
      const response = await request(app.getHttpServer()).get(`/general`).expect(200);

      expect(response.body.data).toBeArray();
    });
  });

  describe('POST general settings', () => {
    const testSetting = {
      key: 'test_key',
      value: 'test_value',
    };

    it('should create general setting', async () => {
      const response = await request(app.getHttpServer())
        .post(`/general`)
        .send([testSetting])
        .expect(201);

      expect(response.body.data).toBeArray();
      expect(response.body.data[0]).toMatchObject(testSetting);
    });

    it('should not create general setting if no request body provided', async () => {
      const response = await request(app.getHttpServer()).post(`/general`).send().expect(400);
      expect(response.body.message).toStartWith('Request validation of body failed');
    });

    it("should not create general setting if request body doesn't match", async () => {
      const response = await request(app.getHttpServer())
        .post(`/general`)
        .send({ test: 'test' })
        .expect(400);
      expect(response.body.message).toStartWith('Request validation of body failed');
    });
  });
});

describe('Tile Configuration (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let testDb: TestDb;
  TestDb.setup(new ConfigService(), t => (testDb = t));

  const testConfig = {
    tileName: 'Test name',
    desc: 'Test desc',
    appUrl: 'Test appUrl',
    iconUrl: 'https://picsum.photos/200',
    tileColor: '#ffffff',
    tileTextColor: '#000000',
  };

  const configToUpdate = {
    tileName: 'Updated name',
  };

  const incorrectBody = { test: 'test' };

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule.forE2E(testDb.dbName)],
    }).compile();

    connection = getConnectionManager().get('default');

    app = moduleFixture.createNestApplication();
    authMiddleware(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET tile configurations', () => {
    it('should get a list of tile configurations', async () => {
      const response = await request(app.getHttpServer()).get(`/tile-configuration`).expect(200);

      expect(response.body.data).toBeArray();
    });
  });

  describe('POST tile configurations', () => {
    it('should create tile configuration', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tile-configuration`)
        .send(testConfig)
        .expect(201);

      expect(response.body.data).toBeObject();
      expect(response.body.data).toMatchObject(testConfig);
    });

    it("should not create tile configuration if request body doesn't match", async () => {
      const response = await request(app.getHttpServer())
        .post(`/tile-configuration`)
        .send({ test: 'test' })
        .expect(400);

      expect(response.body.message).toMatch('"test" is not allowed');
    });
  });

  describe('PUT tile configurations', () => {
    it('should update tile configuration by id', async () => {
      const created = await request(app.getHttpServer())
        .post(`/tile-configuration`)
        .send(testConfig)
        .expect(201);

      const updated = await request(app.getHttpServer())
        .put(`/tile-configuration/${created.body.data.id}`)
        .send(configToUpdate)
        .expect(200);

      expect(updated.body.data).toBeObject();
      expect(updated.body.data).toMatchObject({ ...testConfig, ...configToUpdate });
    });

    it("should not update tile configuration if request body doesn't match", async () => {
      const created = await request(app.getHttpServer())
        .post(`/tile-configuration`)
        .send(testConfig)
        .expect(201);

      const updated = await request(app.getHttpServer())
        .put(`/tile-configuration/${created.body.data.id}`)
        .send(incorrectBody)
        .expect(400);

      expect(updated.body.message).toMatch('"test" is not allowed');
    });

    it('should return 404 if no tile configuration was found', async () => {
      const nonExistedId = 0;

      const updated = await request(app.getHttpServer())
        .put(`/tile-configuration/${nonExistedId}`)
        .send(configToUpdate)
        .expect(404);

      expect(updated.body.message).toMatch(`Tile Configuration ${nonExistedId} not found`);
    });
  });

  describe('DELETE tile configuration by ID', () => {
    it('should delete tile configuration by id', async () => {
      const created = await request(app.getHttpServer())
        .post(`/tile-configuration`)
        .send(testConfig)
        .expect(201);

      const deleted = await request(app.getHttpServer())
        .delete(`/tile-configuration/${created.body.data.id}`)
        .expect(200);

      expect(deleted.body.data).toBe(true);
    });
  });

  describe('PUT tile configuration to change order', () => {
    it('should change tile configurations order', async () => {
      const first = await request(app.getHttpServer())
        .post(`/tile-configuration`)
        .send(testConfig)
        .expect(201);

      const second = await request(app.getHttpServer())
        .post(`/tile-configuration`)
        .send(testConfig)
        .expect(201);

      const firstChanged = await request(app.getHttpServer())
        .put(`/tile-configuration/change-position`)
        .send({
          fromId: first.body.data.id,
          toId: second.body.data.id,
        })
        .expect(200);

      expect(firstChanged.body.data).toBeObject();
      expect(firstChanged.body.data).toMatchObject({
        ...first.body.data,
        order: second.body.data.order,
      });
    });

    it("should return 404 if one of tile configurations wasn't found", async () => {
      const nonExistedId = 9999;

      const first = await request(app.getHttpServer())
        .post(`/tile-configuration`)
        .send(testConfig)
        .expect(201);

      const firstChanged = await request(app.getHttpServer())
        .put(`/tile-configuration/change-position`)
        .send({
          fromId: first.body.data.id,
          toId: nonExistedId,
        })
        .expect(404);

      expect(firstChanged.body.message).toMatch(
        `One of properties (or both) with ${first.body.data.id} or ${nonExistedId} id does not exist.`,
      );
    });
  });
});
