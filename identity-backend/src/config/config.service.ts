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

  database: Joi.object().keys({
    host: Joi.string().required(),
    port: Joi.number().integer().greater(0).required(),
    user: Joi.string().required(),
    pass: Joi.string().required(),
    name: Joi.string().required(),
    ssl: Joi.boolean().required(),
  }),

  cumulocity: Joi.object().keys({
    disabled: Joi.boolean().required(),
    user: Joi.string().allow(''),
    password: Joi.string().allow(''),
    baseUrl: Joi.string().allow(''),
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

  keycloak: Joi.object({
    baseUrl: Joi.string().uri(),
    realmName: Joi.string().min(1).required(),
    clientId: Joi.string(),
    clientSecret: Joi.string(),
    appClientId: Joi.string(),
    tokenRefreshIntervallSeconds: Joi.number().min(10),
  }),

  hostName: Joi.string().min(1).required(),

  useHttps: Joi.boolean().required(),
});

/**
 * Configuration Object, implemented as injectable ConfigService
 */
@Injectable()
export class ConfigService extends AbstractConfigService {
  httpPort = switchEnv(
    {
      development: 13007,
    },
    Number(process.env.APP_PORT || process.env.APP_PORT_IDENTITY) || 8080,
  );

  hostName = process.env.APP_HOSTNAME || 'localhost';

  useHttps = ['1', 'true', 'yes', 'on'].includes(process.env.APP_USE_HTTPS || 'true');

  database = {
    host: process.env.APP_DB_HOST || '',
    port: Number(process.env.APP_DB_PORT) || 3306,
    user: process.env.APP_DB_USER || '',
    pass: process.env.APP_DB_PASS || '',
    name: process.env.APP_DB_NAME || '',
    ssl: [1, '1', true, 'true'].includes(process.env.APP_DB_SSL || ''),
  };

  cumulocity = {
    disabled: ['true', '1', 'on'].includes(process.env.APP_CUMULOCITY_DISABLED || 'false'),
    user: process.env.APP_CUMULOCITY_USER || '',
    password: process.env.APP_CUMULOCITY_PASSWORD || '',
    baseUrl: process.env.APP_CUMULOCITY_BASE_URL || '',
  };

  log = {
    level: (process.env.LOG_LEVEL || 'info') as LogLevels,
    namespace: 'app',
    logPath: process.env.APP_LOG_PATH || undefined,
  };

  keycloak = {
    realmName: process.env.APP_KEYCLOAK_REALM_NAME || '',
    baseUrl: process.env.APP_KEYCLOAK_BASE_URL || '',
    clientId: process.env.APP_KEYCLOAK_CLIENT_ID || '',
    clientSecret: process.env.APP_KEYCLOAK_CLIENT_SECRET || '',
    tokenRefreshIntervallSeconds: 58,
  };

  /**
   * The base URL of the system ("origin")
   *
   * @returns Return the base URL of the system, based on env vars
   * `APP_HOSTNAME` and `APP_USE_HTTPS`. The result has the form of:
   * `https://my.domain.tld` (always without slash at the end)
   */
  getSystemOriginUrl(): string {
    if (this.hostName.startsWith('http')) {
      throw new Error(`Check env var 'APP_HOSTNAME': it must be only the hostname, no URL etc.`);
    }

    return [this.useHttps ? 'https' : 'http', '://', this.hostName.trim().replace(/\//g, '')].join(
      '',
    );
  }
}

// This line ensures the configuration object matches the defined schema
Joi.assert(new ConfigService(), CONFIG_SCHEMA, 'Invalid configuration');
