import { LogLevels } from '@elunic/logger';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import * as Joi from 'joi';
import { AbstractConfigService, AbstractConfigServiceSchema } from 'shared/backend';

import { envRef, switchEnv } from './switchEnv';

dotenvExpand(dotenv.config());

/**
 * Configuration validation schema - when changing the configuration, adjust this first,
 * then change the ConfigService until the config instance validates
 */
const CONFIG_SCHEMA = AbstractConfigServiceSchema.keys({
  httpPort: Joi.number().integer().greater(0).required(),

  database: Joi.object().keys({
    host: Joi.string().required(),
    port: Joi.number().integer().greater(0).required(),
    user: Joi.string().required(),
    pass: Joi.string().required(),
    name: Joi.string().required(),
    ssl: Joi.boolean().required(),
  }),

  influxdb: Joi.object().keys({
    url: Joi.string().required(),
    token: Joi.string().required(),
    bucket: Joi.string().required(),
    organization: Joi.string().required(),
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

  demoDataEnabled: Joi.boolean().required(),
});

/**
 * Configuration Object, implemented as injectable ConfigService
 */
@Injectable()
export class ConfigService extends AbstractConfigService {
  httpPort = Number(process.env.APP_PORT || process.env.APP_PORT_DEMO_DATA) || 8080;

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
      e2e: envRef('testing'),
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

  influxdb = {
    url: process.env.INFLUXDB_URL || '',
    token: process.env.INFLUX_TOKEN || '',
    bucket: process.env.INFLUX_BUCKET || '',
    organization: process.env.INFLUX_ORGANIZATION || '',
  };

  log = {
    level: (process.env.LOG_LEVEL || 'info') as LogLevels,
    namespace: 'app',
    logPath: process.env.APP_LOG_PATH || undefined,
  };

  demoDataEnabled = [1, '1', true, 'true'].includes(process.env.APP_DEMO_DATA_ENABLED || '');
}

// This line ensures the configuration object matches the defined schema
Joi.assert(new ConfigService(), CONFIG_SCHEMA, 'Invalid configuration');
