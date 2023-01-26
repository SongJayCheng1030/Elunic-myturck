import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Injectable } from '@nestjs/common';
import { get, has } from 'lodash';
import { AbstractConfigService } from 'shared/backend';

import { isDevelopment } from '../is-dev';
import { LOCAL_PORT_MAP, SharedServiceEnumMap } from '.';
import { SharedService } from './shared-service';

@Injectable()
export class SharedConfigService {
  constructor(
    private readonly configService: AbstractConfigService,
    @InjectLogger(`SharedConfigService`)
    private logger: Logger,
  ) {}

  /**
   * Returns the configured internal URL of the interned service from
   * the environment variables (AbstractConfigService implemented by
   * every service). Throws an error if the name could not be found
   *
   * @param service The service for which the URL should be searched
   * @returns The (internal) URL to the service
   */
  getInternalServiceUrlOrFail(service: SharedService) {
    const serviceVariableName = (service ?? '').toString();
    this.logger.debug(`getInternalServiceUrlOrFail(${serviceVariableName})`);

    // The new way utilized env vars to resolve another service
    // and not configuration vars
    const envVarName = SharedServiceEnumMap[service];
    if (envVarName) {
      let resolvedUrl = '';
      if (isDevelopment()) {
        resolvedUrl = get(LOCAL_PORT_MAP, envVarName) || '';
      } else {
        resolvedUrl = get(process.env, envVarName) || '';
      }

      this.logger.debug(` resolved to ${envVarName} = ${resolvedUrl} (isDev=${isDevelopment()})`);
      if (resolvedUrl) {
        return resolvedUrl;
      }
    }

    // @deprecated should be removed long term
    if (
      has(this.configService, serviceVariableName) &&
      typeof get(this.configService, serviceVariableName) === 'string'
    ) {
      const serviceName = (get(this.configService, serviceVariableName) || '').trim();

      if (!serviceName) {
        throw new Error(`Path to service for ${service} is empty (illegal configuration)`);
      }

      return serviceName;
    }

    throw new Error(`Unknown path to service: ${service} (not configured)`);
  }
}
