/* eslint-disable no-console */ // We don't have a logger available everywhere in this file.
import 'dotenv/config';

import { LogService } from '@elunic/logger';
import { LOGGER } from '@elunic/logger-nestjs';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

process.env.TZ = 'UTC';

console.log(`${new Date().toISOString()} Starting up`);
console.log(
  `${new Date().toISOString()} NODE_ENV=${process.env.NODE_ENV}`,
  `LOG_LEVEL=${process.env.LOG_LEVEL}`,
);

(async (): Promise<void> => {
  const app = await NestFactory.create(AppModule.forApp());

  const configService = app.get<ConfigService>('ConfigService');
  const logService = app.get<LogService>(LOGGER);

  await app.listen(configService.httpPort);
  logService.info(`Listening on port ${configService.httpPort}`);
})().catch(err => {
  console.error(`${new Date().toISOString()} Fatal error during startup`, err);
  process.exit(1);
});
