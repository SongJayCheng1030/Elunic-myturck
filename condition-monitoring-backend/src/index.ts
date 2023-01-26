/* eslint-disable no-console */ // We don't have a logger available everywhere in this file.
import { LogService } from '@elunic/logger';
import { LOGGER } from '@elunic/logger-nestjs';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { enableDevCors } from 'shared/nestjs';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

console.log(`${new Date().toISOString()} Starting up`);
console.log(
  `${new Date().toISOString()} NODE_ENV=${process.env.NODE_ENV}`,
  `LOG_LEVEL=${process.env.LOG_LEVEL}`,
);

(async (): Promise<void> => {
  const app = await NestFactory.create(AppModule.forApp(), { bodyParser: false });
  app.setGlobalPrefix('v1');
  enableDevCors(app);

  const configService = app.get(ConfigService);
  const logService = app.get<LogService>(LOGGER);

  SwaggerModule.setup(
    '/api/docs',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Shopfloor.io Condition Monitoring Backend')
        .setDescription('API documentation of Shopfloor.io Condition Monitoring Backend')
        .setVersion('3.0')
        .addServer('../../', 'Condition Monitoring Service')
        .addBearerAuth()
        .build(),
    ),
  );

  await app.listen(configService.httpPort);
  logService.info(`Listening on port ${configService.httpPort}`);
})().catch(err => {
  console.error(`${new Date().toISOString()} Fatal error during startup`, err);
  process.exit(1);
});
