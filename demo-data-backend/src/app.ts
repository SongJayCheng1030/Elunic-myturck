/* eslint-disable no-console */ // We don't have a logger available everywhere in this file.

import { LogService } from '@elunic/logger';
import { LOGGER } from '@elunic/logger-nestjs';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { DemoDataService } from './demo-data/demo-data.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require(process.cwd() + '/package.json');

console.log(`${new Date().toISOString()} Starting up`);
console.log(
  `${new Date().toISOString()} NODE_ENV=${process.env.NODE_ENV}`,
  `LOG_LEVEL=${process.env.LOG_LEVEL}`,
);

(async (): Promise<void> => {
  const app = await NestFactory.create(AppModule.forApp());
  const configService = app.get<ConfigService>('ConfigService');
  const logService = app.get<LogService>(LOGGER);

  try {
    const demoDataService = app.get<DemoDataService>('DemoDataService');
    demoDataService.startProduction();
  } catch (ex) {
    logService.fatal(`Failed to start demo data service:`, ex);
    process.exit(2);
  }

  SwaggerModule.setup(
    '/api/docs',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle(packageJson.name)
        .setDescription('API documentation of all integrated modules')
        .setVersion(packageJson.version)
        .build(),
    ),
  );

  await app.listen(configService.httpPort);
  logService.info(`Listening on port ${configService.httpPort}`);
})().catch(err => {
  console.error(`${new Date().toISOString()} Fatal error during startup`, err);
  console.error(`Error generation demo data`);
  process.exit(1);
});
