// import { INestApplication } from '@nestjs/common';
// import { Test } from '@nestjs/testing';
// import * as bcrypt from 'bcrypt';
// import * as request from 'supertest';
// import { TestDb } from 'test/e2e/util/TestDb';
// import { Connection, getConnection } from 'typeorm';

// import { AppModule } from '../../src/app.module';
// import { ConfigService } from '../../src/config/config.service';
// import { User } from '../../src/users/user/user.entity';

// describe('AppController (e2e)', () => {
//   let app: INestApplication;
//   let connection: Connection;
//   const configService: ConfigService = new ConfigService();
//   let testDb: TestDb;
//   TestDb.setup(configService, t => (testDb = t));

//   beforeEach(async () => {
//     const moduleFixture = await Test.createTestingModule({
//       imports: [AppModule.forE2E(testDb.dbName)],
//     }).compile();

//     connection = getConnection();

//     app = moduleFixture.createNestApplication();
//     await app.init();

//     await connection.manager.insert(User, {
//       name: 'someName',
//       email: 'success@test.com',
//       password: await bcrypt.hash('password', 10),
//     });
//   });

//   afterEach(async () => {
//     await app.close();
//   });

//   describe('POST /auth/login', () => {
//     it('should return 404 (Not Found for unexisted user)', () => {
//       return request(app.getHttpServer())
//         .post('/auth/login')
//         .send({ username: 'not@found.user', password: 'password' })
//         .expect(404);
//     });

//     it('should return 200 (for successful logging in)', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/auth/login')
//         .send({ username: 'someName', password: 'password' })
//         .expect(200);

//       expect(response.body.data.token).toBeDefined();
//     });
//   });
// });
