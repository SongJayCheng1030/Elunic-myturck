import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import { Credentials } from '@keycloak/keycloak-admin-client/lib/utils/auth';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { get } from 'lodash';
import { v4 as uuid } from 'uuid';

import { ConfigService } from '../config/config.service';

export type KKRepresentation = GroupRepresentation | UserRepresentation | RoleRepresentation;

/**
 * The `KeycloakRpcService` is a base service which performs the actual
 * communication between Shopfloor (this service) and Keycloak. This
 * service provides some utility methods which come in handy during the
 * communication.
 */
@Injectable()
export class KeycloakRpcService {
  private keycloakClient!: KcAdminClient;
  private keycloakConfig: NonNullable<ConfigService['keycloak']>;
  private isConnected = false;

  constructor(
    private readonly config: ConfigService,
    @InjectLogger(`KeycloakRpcService`)
    private readonly logger: Logger,
  ) {
    this.keycloakConfig = config.keycloak as NonNullable<ConfigService['keycloak']>;
  }

  /**
   * Ensurs a _working_ connection to Keycloak, i.e. if
   * not connected a connection is established
   */
  async ensureConnected() {
    if (!this.isConnected) {
      await this.init();
    }
  }

  /**
   * Initializes the connection to Keycloak, i.e.
   * establishes the connection and starts a listener to
   * re-authenticate every so often
   */
  async init() {
    // Only do it once
    if (this.isConnected) {
      this.logger.info(`KeycloakRpcService#init() called but already connected!`);
      return;
    }

    this.keycloakClient = new KcAdminClient({
      baseUrl: this.keycloakConfig.baseUrl,
      realmName: this.keycloakConfig.realmName,
    });

    const credentials: Credentials = {
      grantType: 'client_credentials',
      clientId: this.keycloakConfig.clientId,
      clientSecret: this.keycloakConfig.clientSecret,
    };

    try {
      await this.keycloakClient.auth(credentials);
    } catch (exRaw) {
      const ex = this.tryParseExceptionToMoreReadble(exRaw);
      this.isConnected = false;

      if (this.checkIfAndPrintSyscallException(ex)) {
        this.logger.fatal(`Exiting application.`);
        process.exit(1);
      }

      throw ex;
    }

    this.isConnected = true;

    // Refresh the connection
    setInterval(
      () => this.keycloakClient.auth(credentials),
      this.config.keycloak.tokenRefreshIntervallSeconds * 1000,
    );
  }

  /**
   * Main wrapper function to execute Keycloak API calls. This function
   * wraps the main call, provides the client (does the connection attempt
   * if not yet connected) and handles exceptions
   *
   * @param callback The callback which performs the actual API action and
   * returns the result
   * @param errorHandler An error handler function
   * @param passThrough If the exception should be simply passed through
   * (if any)
   * @returns The result returned by the `callback`
   */
  async wrapCall<T>(
    callback: (client: KcAdminClient) => Promise<T>,
    errorHandler?: (httpStatus: number, err: Error) => void,
    passThrough = false,
  ): Promise<T> {
    await this.ensureConnected();

    try {
      const client = await this.keycloakClient;
      return await callback(client);
    } catch (exRaw) {
      const ex = this.tryParseExceptionToMoreReadble(exRaw);
      this.checkIfAndPrintSyscallException(ex);

      if (passThrough) {
        throw ex;
      }

      if (errorHandler) {
        errorHandler((ex as any).response?.status, ex as Error);
      } else {
        // @ts-ignore
        this.printErrorInformation(ex, '', 0);
      }

      this.logger.error(`Keycloak API call failed:`, ex);
      throw new InternalServerErrorException(`Keycloak internal API call failed (see logs)`);
    }
  }

  printErrorInformation(err: Error, operationSlug?: string, httpStatus?: number): string {
    const errId = uuid();

    this.logger.error(`---[ Keycloak operation error ]---`);
    this.logger.error(`Operation id ...........: ${errId}`);
    if (operationSlug) {
      this.logger.error(`Operation ..............: ${operationSlug}`);
    }

    if (httpStatus) {
      this.logger.error(`HTTP response status ...: ${httpStatus}`);
    }

    // TODO
    // @ts-ignore
    if (err && err.isAxiosError) {
      const aerr = err as AxiosError;
      this.logger.error(`Received response:\n${JSON.stringify(aerr.response?.data, null, 2)}`);
    } else {
      this.logger.error(err);
    }
    this.logger.error(`--- ---`);

    return errId;
  }

  /**
   * Keycloak stores attributes inside `representation?.attributes` in an
   * array format. This function extracts a value of it and returns it.
   *
   * __WARNING:__ Despite the fact that you can provide a type `T`, KK always
   * stores strings. The dynamic type is more for Typescript. No conversion
   * is performed
   *
   * @param rep The Keycloak representation object to extract from
   * @param attrKey The attribute key to get the value for
   * @param defaultValue A default value
   * @returns The value
   */
  getAttOrDef<T = string>(rep: KKRepresentation, attrKey: string, defaultValue: T): T {
    // Ensure proper input
    if (!rep || !attrKey || !rep.attributes || typeof rep.attributes !== 'object') {
      return defaultValue;
    }

    const vals = rep.attributes[attrKey];
    if (typeof vals === 'undefined' || !Array.isArray(vals) || vals.length < 1) {
      return defaultValue;
    }

    return vals[0] as T;
  }

  /**
   * Keycloak stores attributes inside `representation?.attributes` in an
   * array format. This function extracts a value of it and parses the string
   * as JSON and returns the object
   *
   * @param rep The Keycloak representation object to extract from
   * @param attrKey The attribute key to get the value for
   * @param defaultValue A default value
   * @returns The JSON value as javascript object
   */
  getAttOrDefJson<T>(rep: KKRepresentation, attrKey: string, defaultValue: T) {
    const data = this.getAttOrDef<string | null>(rep, attrKey, null);

    if (!data) {
      return defaultValue;
    }

    // Check if the string is JSON encoded
    try {
      return JSON.parse(data) as T;
    } catch (ex) {
      this.logger.error(`getAttOrDefJson(..., ${attrKey}, ...): failed: ${ex}`);
      return defaultValue;
    }
  }

  /**
   * Contrary function for `getAttOrDefJson()` which transforms a Keycloak
   * attribute to the Keycloak-Array structure and stringifies the JSON value
   *
   * @param attrKey The attribute key
   * @param attrValue The JSON value
   * @returns Keycloak compatible attribute value which can be combined e.g.
   * using the spread syntax
   */
  marshallJsonAttr<T>(attrKey: string, attrValue: T): { [key: string]: string[] } {
    return {
      [attrKey]: [JSON.stringify(attrValue)],
    };
  }

  /**
   * Contrary function for `getAttOrDef()` which transforms a Keycloak
   * attribute to the Keycloak-Array structure and stringifies the value
   *
   * @param attrKey The attribute key
   * @param attrValue The value
   * @returns Keycloak compatible attribute value which can be combined e.g.
   * using the spread syntax
   */
  marshallAttr<T>(attrKey: string, attrValue: T): { [key: string]: string[] } {
    return {
      [attrKey]: [`${attrValue || ''}`],
    };
  }

  /**
   * Helper function which checks if the given error / exception is
   * a common system call error (e.g. connection refused, ...) and
   * prints an error message for this
   *
   * @param ex The error / exception to check for and print
   * @returns `true` if it has been "handled" (printed) by this function
   * and `false` if this function didn't perform any action
   */
  private checkIfAndPrintSyscallException(ex: Error | any | unknown): boolean {
    const msg = `${ex || ''}`;

    let syscallToHandle = '';
    if (msg.indexOf('ECONNREFUSED') > -1) {
      syscallToHandle = 'ECONNREFUSED';
    } else if (msg.indexOf('ECONNRESET') > -1) {
      syscallToHandle = 'ECONNRESET';
    } else if (msg.indexOf('ETIMEDOUT') > -1) {
      syscallToHandle = 'ETIMEDOUT';
    } else if (msg.indexOf('ENOTFOUND') > -1) {
      syscallToHandle = 'ENOTFOUND (DNS/Hostname?)';
    }

    if (syscallToHandle.length > 0) {
      this.logger.fatal(
        [
          `Error while trying to talk to Keycloak! Details are:`,
          `# ###################`,
          `# Error: cannot connect to Keycloak! (${syscallToHandle})`,
          `#  `,
          `# Original message: ${msg}`,
          `#  `,
          `# Maybe your config is wrong? Here it is:`,
          `# KK base URL ......: ${this.keycloakConfig.baseUrl}`,
          `# Realm name .......: ${this.keycloakConfig.realmName}`,
          `# Client id ........: ${this.keycloakConfig.clientId}`,
          `# Client secret ....: ${(this.keycloakConfig.clientSecret || '').substring(0, 3)}****`,
          `# ###################`,
        ].join('\n'),
      );

      return true;
    }

    return false;
  }

  /**
   * Tries to parse a Keycloak client exception and returns a more human
   * readable exception
   *
   * @param ex The exception to analyze / parse
   * @returns Either the original exception (if not processible) or a
   * parsed exception
   */
  private tryParseExceptionToMoreReadble(ex: Error | unknown): Error {
    if (get(ex, 'isAxiosError')) {
      const statusCode = (ex as any).response.status;
      const statusText = (ex as any).response.statusText;
      const body = (ex as any).response.data || {};

      let msg = `Unkown error`;
      if (typeof body === 'object' && body.error && body.error_description) {
        msg = `${body.error_description || 'N/A'} (${body.error || 'N/A'})`;
      } else if (typeof body === 'object' && body.error) {
        msg = `${body.error || 'N/A'}`;
      } else {
        msg = `HTTP ${statusCode} ${statusText} error: ${JSON.stringify(body)}`;
      }

      this.logger.error(`Keycloak error: ${msg}`);
      if (msg.indexOf(`service account`) > -1 && msg.indexOf(`not enabled`) > -1) {
        this.logger.fatal(` `);
        this.logger.fatal(
          `Did you enable the service-account-mode for the Keycloak client '${this.config.keycloak.clientId}'?`,
        );
        this.logger.fatal(`See the documentation for a guide!`);
        this.logger.fatal(` `);
      }

      let message;
      switch (statusCode) {
        case 400:
          message = `Invalid request to Keycloak: ${msg}`;
          throw new BadRequestException(message);
        case 401:
          message = `Not authorized for Keycloak operation: ${msg}`;
          throw new UnauthorizedException(message);
        case 404:
          message = `Not found: ${msg}`;
          throw new NotFoundException(message);
        case 409:
          message = body?.errorMessage ?? `Conflict: ${msg}`;
          throw new ConflictException(message);
        default:
          message = `Keycloak communication error: ${msg}`;
          throw new InternalServerErrorException(message);
      }
    }

    // @ts-ignore
    return ex as Error;
  }
}
