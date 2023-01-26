import { LogLevels } from '@elunic/logger';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import * as Joi from 'joi';

import { switchEnv } from './switchEnv';

dotenvExpand(dotenv.config());

export const CONNECTOR_ADAPTER = ['mqtt', 'c8y', 'simulation'] as const;
export type ConnectionAdapter = typeof CONNECTOR_ADAPTER[number];

/**
 * Configuration validation schema - when changing the configuration, adjust this first,
 * then change the ConfigService until the config instance validates
 */
const CONFIG_SCHEMA = Joi.object({
  httpPort: Joi.number().integer().greater(0).required(),

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

  adapter: Joi.allow(...CONNECTOR_ADAPTER).required(),

  mqtt: Joi.object().keys({
    protocol: Joi.allow('mqtt', 'mqtts').required(),
    host: Joi.string().allow(''),
    port: Joi.number().required(),
    user: Joi.string().allow(''),
    pass: Joi.string().allow(''),
  }),

  cumulocity: Joi.object().keys({
    user: Joi.string().allow(''),
    password: Joi.string().allow(''),
    baseUrl: Joi.string().allow(''),
  }),

  influx: Joi.object().keys({
    org: Joi.string().required(),
    bucket: Joi.string().required(),
    url: Joi.string().uri().required(),
    token: Joi.string().optional(),
  }),

  simulation: Joi.object().keys({
    numDevices: Joi.number().min(1).max(100).required(),
    emitInterval: Joi.number().min(10).required(),
  }),
});

/**
 * Configuration Object, implemented as injectable ConfigService
 */
@Injectable()
export class ConfigService {
  httpPort = Number(process.env.APP_PORT) || 8010;

  log = {
    level: (process.env.LOG_LEVEL || 'info') as LogLevels,
    namespace: 'app',
    logPath: process.env.APP_LOG_PATH || undefined,
  };

  mqtt = switchEnv(
    {
      development: {
        protocol: 'mqtt',
        host: process.env.MQTT_HOST,
        port: Number(process.env.MQTT_PORT) || 443,
        user: process.env.MQTT_USER,
        pass: process.env.MQTT_PASS,
      },
    },
    {
      protocol: [1, '1', true, 'true'].includes(process.env.MQTT_SSL || '') ? 'mqtts' : 'mqtt',
      host: process.env.MQTT_HOST,
      port: Number(process.env.MQTT_PORT) || 443,
      user: process.env.MQTT_USER,
      pass: process.env.MQTT_PASS,
    },
  );

  adapter = (process.env.APP_CONNECTOR_ADAPTER || 'mqtt') as ConnectionAdapter;

  cumulocity = {
    user: process.env.APP_CUMULOCITY_USER || '',
    password: process.env.APP_CUMULOCITY_PASSWORD || '',
    baseUrl: process.env.APP_CUMULOCITY_BASE_URL || '',
  };

  influx = {
    org: process.env.INFLUX_ORGANIZATION || '',
    bucket: process.env.INFLUX_BUCKET || '',
    url: process.env.INFLUXDB_URL || '',
    token: process.env.INFLUX_TOKEN || '',
  };

  simulation = {
    numDevices: Number(process.env.APP_SIMULATION_DEVICES || '10'),
    emitInterval: Number(process.env.APP_SIMULATION_EMIT_INTERVAL || '100'),
  };
}

// This line ensures the configuration object matches the defined schema
Joi.assert(new ConfigService(), CONFIG_SCHEMA, 'Invalid configuration');
