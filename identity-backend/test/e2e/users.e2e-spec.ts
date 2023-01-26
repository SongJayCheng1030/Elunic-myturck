// import { INestApplication } from '@nestjs/common';
// import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
// import { JwtService } from '@nestjs/jwt';
// import { Test } from '@nestjs/testing';
// import * as bcrypt from 'bcrypt';
// import * as request from 'supertest';
// import { TestDb } from 'test/e2e/util/TestDb';
// import { Connection, getConnection } from 'typeorm';

// import { AppModule } from '../../src/app.module';
// import { ConfigService } from '../../src/config/config.service';

// describe('UsersController (e2e)', () => {
//   describe('with ignoring JWT', () => {
//     let app: INestApplication;
//     let connection: Connection;
//     process.env.AUTH_IGNORE_JWT = 'true';
//     const configService: ConfigService = new ConfigService();

//     let testDb: TestDb;
//     TestDb.setup(configService, t => (testDb = t));

//     beforeEach(async () => {
//       const moduleFixture = await Test.createTestingModule({
//         imports: [AppModule.forE2E(testDb.dbName)],
//       })
//         .overrideProvider(ConfigService)
//         .useValue(configService)
//         .compile();

//       connection = getConnection();

//       app = moduleFixture.createNestApplication();
//       await app.init();

//       await connection.manager.insert(User, {
//         name: 'someName',
//         email: 'success@test.com',
//         password: await bcrypt.hash('password', 10),
//       });
//     });

//     afterEach(async () => {
//       await app.close();
//     });

//     describe('GET /users', () => {
//       it('should return 200 without jwt checking', () => {
//         return request(app.getHttpServer()).get('/users').send().expect(200);
//       });
//     });
//   });

//   describe('without ignoring JWT', () => {
//     let app: INestApplication;
//     let connection: Connection;
//     let jwtService: JwtService;
//     process.env.AUTH_IGNORE_JWT = 'false';
//     const configService: ConfigService = new ConfigService();
//     let testDb: TestDb;
//     TestDb.setup(configService, t => (testDb = t));

//     const user1Id = randomStringGenerator();

//     beforeEach(async () => {
//       const moduleFixture = await Test.createTestingModule({
//         imports: [AppModule.forE2E(testDb.dbName)],
//       }).compile();

//       connection = getConnection();
//       jwtService = moduleFixture.get(JwtService);

//       app = moduleFixture.createNestApplication();
//       await app.init();

//       await connection.manager.insert(User, {
//         id: user1Id,
//         name: 'someName',
//         email: 'success@test.com',
//         password: await bcrypt.hash('password', 10),
//       });
//     });

//     afterEach(async () => {
//       await app.close();
//     });

//     describe('GET /users', () => {
//       it('should return 401 Unauthorized', () => {
//         return request(app.getHttpServer()).get('/users').send().expect(401);
//       });
//     });

//     describe('GET /users/:userId/request_password_reset', () => {
//       it('should return 401 Unauthorized', () => {
//         return request(app.getHttpServer())
//           .get('/users/11111/request_password_reset')
//           .send()
//           .expect(401);
//       });

//       it('should return 403 for invalid Internal Token', () => {
//         return request(app.getHttpServer())
//           .get(`/users/${user1Id}/request_password_reset`)
//           .set('Authorization', 'Bearer wrongToken')
//           .send()
//           .expect(403);
//       });

//       it('should return 403 for valid User Token', async () => {
//         const token = await request(app.getHttpServer())
//           .post('/auth/login')
//           .send({ username: 'someName', password: 'password' })
//           .then(response => response.body.data.token);

//         return request(app.getHttpServer())
//           .get(`/users/${user1Id}/request_password_reset`)
//           .set('Authorization', `Bearer ${token}`)
//           .send()
//           .expect(403);
//       });

//       it('should return 200 for valid Internal Token', () => {
//         const token = jwtService.sign(
//           { isAllAllowed: true },
//           {
//             algorithm: configService.jwt.jwtInternalAlgorithm,
//             privateKey: configService.getJwtInternalSecret(),
//             secret: configService.getJwtInternalSecret(),
//           },
//         );

//         return request(app.getHttpServer())
//           .get(`/users/${user1Id}/request_password_reset`)
//           .set('Authorization', `Bearer ${token}`)
//           .send()
//           .expect(200);
//       });
//     });

//     describe('reset password flow (via internal token)', () => {
//       it('should change password', async () => {
//         const internalToken = jwtService.sign(
//           { isAllAllowed: true },
//           {
//             algorithm: configService.jwt.jwtInternalAlgorithm,
//             privateKey: configService.getJwtInternalSecret(),
//             secret: configService.getJwtInternalSecret(),
//           },
//         );

//         const passwordResetToken = await request(app.getHttpServer())
//           .post(`/users/${user1Id}/request_password_reset`)
//           .set('Authorization', `Bearer ${internalToken}`)
//           .send()
//           .then(res => res.body.data.token);

//         const userToken = await request(app.getHttpServer())
//           .post('/auth/login')
//           .send({ username: 'someName', password: 'password' })
//           .then(res => res.body.data.token);

//         await request(app.getHttpServer())
//           .post(`/users/${user1Id}/reset_password`)
//           .set('Authorization', `Bearer ${userToken}`)
//           .send({ newPassword: 'password_1', passwordResetToken })
//           .expect(200);

//         // old password should be wrong
//         await request(app.getHttpServer())
//           .post('/auth/login')
//           .send({ username: 'someName', password: 'password' })
//           .expect(404);

//         // new password should be correct
//         await request(app.getHttpServer())
//           .post('/auth/login')
//           .send({ username: 'someName', password: 'password_1' })
//           .expect(200);
//       });
//     });
//   });
// });
