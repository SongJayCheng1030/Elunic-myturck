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
  httpPort: Joi.number().integer().greater(0).required(),

  externalServiceUrl: Joi.string().uri(),
  fileServiceUrl: Joi.string().uri(),
  assetServiceUrl: Joi.string().uri(),

  cumulocity: Joi.object().keys({
    disabled: Joi.boolean().required(),
    user: Joi.string().allow(''),
    password: Joi.string().allow(''),
    baseUrl: Joi.string().allow(''),
  }),

  grafana: Joi.object().keys({
    url: Joi.string().uri().required(),
    user: Joi.string().required(),
    pass: Joi.string().required(),
  }),

  influx: Joi.object().keys({
    org: Joi.string().required(),
    bucket: Joi.string().required(),
    url: Joi.string().uri().required(),
    token: Joi.string().optional(),
  }),

  datalake: Joi.object().keys({
    host: Joi.string().required(),
    port: Joi.number().integer().greater(0).required(),
    user: Joi.string().required(),
    pass: Joi.string().required(),
    name: Joi.string().required(),
    ssl: Joi.boolean().required(),
  }),

  database: Joi.object().keys({
    host: Joi.string().required(),
    port: Joi.number().integer().greater(0).required(),
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
      development: 13002,
    },
    Number(process.env.APP_PORT || process.env.APP_PORT_CONDITION_MONITORING) || 8080,
  );

  // provide the path that can be reached through the FE
  // it's used to create the grafana embed path
  // TODO think about creating a `GRAFANA_EMBED_URL`
  externalServiceUrl =
    process.env.APP_SERVICE_URL || 'http://localhost:13104/service/condition-monitoring';
  fileServiceUrl = process.env.APP_SERVICE_URL_FILE || '';
  assetServiceUrl = process.env.APP_SERVICE_URL_ASSET || '';

  cumulocity = {
    disabled: ['true', '1', 'on'].includes(process.env.APP_CUMULOCITY_DISABLED || 'false'),
    user: process.env.APP_CUMULOCITY_USER || '',
    password: process.env.APP_CUMULOCITY_PASSWORD || '',
    baseUrl: process.env.APP_CUMULOCITY_BASE_URL || '',
  };

  grafana = {
    url: process.env.GRAFANA_URL || '',
    user: process.env.GRAFANA_USER || '',
    pass: process.env.GRAFANA_PASS || '',
  };

  influx = {
    org: process.env.INFLUX_ORGANIZATION || '',
    bucket: process.env.INFLUX_BUCKET || '',
    url: process.env.INFLUXDB_URL || '',
    token: process.env.INFLUX_TOKEN || '',
  };

  datalake = switchEnv(
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
      host: process.env.APP_DATALAKE_HOST || '',
      port: Number(process.env.APP_DATALAKE_PORT) || 3306,
      user: process.env.APP_DATALAKE_USER || '',
      pass: process.env.APP_DATALAKE_PASS || '',
      name: process.env.APP_DATALAKE_NAME || '',
      ssl: [1, '1', true, 'true'].includes(process.env.APP_DATALAKE_SSL || ''),
    },
  );

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
