/* eslint-disable no-console */
import { INestApplication } from '@nestjs/common/interfaces';
import { HttpAdapterHost } from '@nestjs/core';
import { Express, NextFunction, Request, Response } from 'express';
import { get } from 'lodash';
import { AuthInfo, AuthInfoPossiblyNoTenant } from 'shared/common/types';

import { isDevelopment } from '../is-dev';
import { SioRights } from '../roles/rights';
import { KeycloakTenantGroupPrefix, KeycloakTenantsAllRootGroupName } from '.';
import { decodeAndVerifyKeycloakToken } from './external-kk-token';
import { injectMockToken } from './local-dev-mock-token';

const urljoin = require('url-join');

const SioRightKeys = Object.values(SioRights);

/**
 * Adds the auth middleware to a Nest application, ensuring that the
 * requesting user has a valid user token and that the `@AuthInfo`
 * decorator can be used in the routes of the service to get the user
 * information. If the value `tenantId` is not set in the IdP token
 * this middleware automagically redirects the user to the tenant frontend
 * to select a tenant to log into
 *
 * @param app The Nest app to add the middleware to
 * @param allowNoTenant An array of URL prefixes to ignore the auto-no-
 * tenant redirect functionality. For example: `[ '/v1/tenants ]` will
 * ignore all requests which start this this URL on all methods. The field
 * `tenantId` might then be `null` and the routes need to deal with this
 * on their own although the type definition says that this field is not
 * null (!!)
 * @deprecated Include the lib module instead
 */
export function authMiddleware(app: INestApplication, allowNoTenant?: string[]): void {
  // Get the express app
  const adapterHost = app.get(HttpAdapterHost);
  const httpAdapter = adapterHost.httpAdapter;
  const instance = httpAdapter.getInstance();

  const expressApp: Express = <Express>instance;

  authMiddlewareExpress(expressApp, allowNoTenant || []);
}

function isAlreadyInstalled(): boolean {
  // @ts-ignore
  if (global['auth_middleware__already'] === true) {
    return true;
  }
  // @ts-ignore
  global['auth_middleware__already'] = true;
  return false;
}

export function authMiddlewareExpress(expressApp: Express, allowNoTenant: string[]): void {
  if (isAlreadyInstalled()) {
    console.debug(
      `authMiddleware() already installed! Remove authMiddleware(...); from 'index.ts'`,
    );
    return;
  }

  // Add the middlewares
  expressApp.use(AuthorizationMiddleware);

  /**
   * Actual express middleware which reads out the authentication data
   * for the current request
   */
  async function AuthorizationMiddleware(req: Request, res: Response, next: NextFunction) {
    injectAuth(req);

    if (!!allowNoTenant && req.auth.tenantId === null) {
      // The tenantId is not set, and we have certain routes which allow for no tenant
      const allowed = allowNoTenant.filter(p => req.url.startsWith(p)).length > 0;
      if (!allowed) {
        if (makeNoTenantRedirect(res)) {
          return;
        }
      }
      // No match, continue ...
    }

    // Check if everything is present
    if (!req.auth) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    // Only debug the token on trace mode
    if (`${process.env.LOG_LEVEL || ''}`.toLowerCase() === 'trace') {
      console.log('---- TOKEN ----');
      console.log(req.auth);
      console.log('----');
    }

    next();
    return;
  }
}

export function injectAuth(req: Request) {
  // For local development, inject a valid JWT
  if (
    process.env.NODE_ENV === 'development' ||
    ['1', 'on', 'true'].includes(process.env.APP_FORCE_MOCK_AUTH || '')
  ) {
    injectMockToken(req);
  }

  // Extract the token
  const tokenResult = getToken(req);

  // Decode the token if present; however, the validation is already
  // done by the proxy server
  if (tokenResult) {
    try {
      req.auth = decodeToken(tokenResult) as AuthInfo;
    } catch (ex) {
      console.debug(`Error in decode token: ${ex}`);
    }
  }
}

function makeNoTenantRedirect(res: Response): boolean {
  const redirectUrl = urljoin(
    `https://${process.env.APP_HOSTNAME || ''}`,
    process.env.APP_SUBPATH || '',
    '/tenant/',
  );
  const redirectUrlValid =
    (process.env.APP_HOSTNAME || '').length > 0 && redirectUrl.startsWith('http');

  if (isDevelopment()) {
    console.warn(
      '\x1b[31m%s\x1b[0m',
      `[WARNING] Current requesting user is not in any tenant! On prod a redirect to ${redirectUrl} would happen`,
    );
    console.warn('\x1b[31m%s\x1b[0m', `[WARNING] But skipped on DEV mode (${isDevelopment()})`);
    return false;
  } else {
    res.status(423).json({
      error: 'Locked',
      errorDescription: 'The current user is currently in no tenant. Please select first a tenant!',
      ...(redirectUrlValid ? { redirectUrl } : {}),
    });
    return true;
  }
}

function getToken(req: Request): string {
  const keyName = Object.keys(req.headers || {}).find(
    p => p.toLowerCase() === 'x-auth-request-access-token',
  );
  const h = get(req.headers, keyName || '');

  if (typeof h === 'string') {
    return (h as string) || '';
  } else if (Array.isArray(h) && h.length > 0) {
    return h[0];
  } else {
    return '';
  }
}

function decodeToken(token: string): AuthInfoPossiblyNoTenant {
  const tokenData = decodeAndVerifyKeycloakToken(token);

  const intermediate: AuthInfoPossiblyNoTenant = {
    token,
    id: tokenData.sub,
    tenantId: tokenData.tenantId || null,
    name:
      tokenData.name ||
      `${tokenData.given_name} ${tokenData.family_name}`.trim() ||
      tokenData.preferred_username ||
      tokenData.email ||
      tokenData.name,
    iat: tokenData.iat,
    exp: tokenData.exp,
    email: tokenData.email || null,

    /**
     * Extract all the user's rights from the Keycloak token and ensure
     * that they are known Shopfloor rights by checking them against the
     * rights list
     */
    // @ts-ignore
    rights: tokenData.realm_access.roles.filter(r => SioRightKeys.indexOf(r) > -1),

    /**
     * If a user is in the Keycloak group `KeycloakTenantsAllRootGroupName`
     * then the user has access
     */
    isMultiTenantAdmin:
      tokenData.groups.findIndex(p => p === `/${KeycloakTenantsAllRootGroupName}`) > -1,

    /**
     * Will contain a list of all tenants (their UUIDs) to which the current
     * user has access to
     */
    tenants:
      (tokenData.groups
        .map(p => {
          const prefix = `/${KeycloakTenantGroupPrefix}`;
          if (p.startsWith(prefix)) {
            return p.substring(prefix.length);
          }
          return null;
        })
        .filter(p => !!p && p.length === 36) as string[]) || [],

    preferredLanguage: tokenData.preferredLanguage || null,
  };

  return intermediate;
}
