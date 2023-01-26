import { LogLevels } from '@elunic/logger';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import * as Joi from 'joi';
import { AbstractConfigService, AbstractConfigServiceSchema } from 'shared/backend';

import { switchEnv } from './switchEnv';

dotenvExpand(dotenv.config());

/**
 * Configuration validation schema - when changing the configuration, adjust this first,
 * then change the ConfigService until the config instance validates
 */
const CONFIG_SCHEMA = AbstractConfigServiceSchema.keys({
  httpPort: Joi.number()
    .integer()
    .greater(0)
    .required(),

  externalServiceUrl: Joi.string().uri(),
  fileServiceUrl: Joi.string().uri(),
  assetServiceUrl: Joi.string().uri(),

  database: Joi.object().keys({
    host: Joi.string().required(),
    port: Joi.number()
      .integer()
      .greater(0)
      .required(),
    user: Joi.string().required(),
    pass: Joi.string().required(),
    name: Joi.string().required(),
    ssl: Joi.boolean().required(),
  }),

  log: Joi.object().keys({
    level: Joi.string().valid(
      LogLevels.Trace,
      LogLevels.Debug,
      LogLevels.Info,
      LogLevels.Warn,
      LogLevels.Error,
      LogLevels.Fatal,
    ),
    namespace: Joi.string().required(),
    logPath: Joi.string().optional(),
  }),
});

/**
 * Configuration Object, implemented as injectable ConfigService
 */
@Injectable()
export class ConfigService extends AbstractConfigService {
  httpPort = switchEnv(
    {
      development: 13005,
    },
    Number(process.env.APP_PORT || process.env.APP_PORT_MAINTENANCE) || 8080,
  );

  externalServiceUrl = process.env.APP_SERVICE_URL || 'http://localhost:13005';
  fileServiceUrl = process.env.APP_SERVICE_URL_FILE || 'http://localhost:13003';
  assetServiceUrl = process.env.APP_SERVICE_URL_ASSET || 'http://localhost:13001';

  database = switchEnv(
    {
      testing: {
        host: process.env.APP_TEST_DB_HOST || '',
        port: Number(process.env.APP_TEST_DB_PORT) || 3306,
        user: process.env.APP_TEST_DB_USER || '',
        pass: process.env.APP_TEST_DB_PASS || '',
        name: process.env.APP_TEST_DB_NAME || '',
        ssl: false,
      },
      e2e: {
        host: process.env.APP_TEST_DB_HOST || '',
        port: Number(process.env.APP_TEST_DB_PORT) || 3306,
        user: process.env.APP_TEST_DB_USER || '',
        pass: process.env.APP_TEST_DB_PASS || '',
        name: process.env.APP_TEST_DB_NAME || '',
        ssl: false,
      },
    },
    {
      host: process.env.APP_DB_HOST || '',
      port: Number(process.env.APP_DB_PORT) || 3306,
      user: process.env.APP_DB_USER || '',
      pass: process.env.APP_DB_PASS || '',
      name: process.env.APP_DB_NAME || '',
      ssl: [1, '1', true, 'true'].includes(process.env.APP_DB_SSL || ''),
    },
  );

  log = {
    level: (process.env.LOG_LEVEL || 'info') as LogLevels,
    namespace: 'app',
    logPath: process.env.APP_LOG_PATH || undefined,
  };
}

export const Config = new ConfigService();

// This line ensures the configuration object matches the defined schema
Joi.assert(Config, CONFIG_SCHEMA, 'Invalid configuration');
