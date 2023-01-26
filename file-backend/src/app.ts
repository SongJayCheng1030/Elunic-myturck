/* eslint-disable no-console */ // We don't have a logger available everywhere in this file.
import { LogService } from '@elunic/logger';
import { LOGGER } from '@elunic/logger-nestjs';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { authMiddleware, enableDevCors, NestCoreLogger } from 'shared/nestjs';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

console.log(`${new Date().toISOString()} Starting up`);
console.log(
  `${new Date().toISOString()} NODE_ENV=${process.env.NODE_ENV}`,
  `LOG_LEVEL=${process.env.LOG_LEVEL}`,
);

async function bootstrap() {
  const app = await NestFactory.create(AppModule.forApp(), {
    logger: new NestCoreLogger(),
  });
  enableDevCors(app);

  const config = app.get(ConfigService);
  const logService = app.get<LogService>(LOGGER);

  SwaggerModule.setup(
    '/api/docs',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('file service')
        .setDescription('API documentation of the file service')
        .setVersion('3.0')
        .addServer('../../', 'File Service')
        .addBearerAuth()
        .build(),
    ),
  );

  authMiddleware(app);

  const httpPort = config.httpPort;
  await app.listen(httpPort);
  logService.info(`Listening on port ${httpPort}`);
}
bootstrap().catch(err => {
  console.error(`${new Date().toISOString()} Fatal error during startup`, err);
  process.exit(1);
});
