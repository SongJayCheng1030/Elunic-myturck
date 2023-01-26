/* eslint-disable no-console */
import { UnauthorizedException } from '@nestjs/common';
import * as Joi from 'joi';
import { decode } from 'jsonwebtoken';

const TokenSchema = Joi.object()
  .keys({
    sub: Joi.string().uuid().required(),
    name: Joi.string().min(1).required(),
    family_name: Joi.alternatives(null, '', Joi.string()).optional(),
    given_name: Joi.alternatives(null, '', Joi.string()).optional(),
    email: Joi.string().optional(),
    tenantId: Joi.alternatives(null, '', Joi.string().uuid()).optional(),
    groups: Joi.array().items(Joi.string().min(1)).min(0).required(),
    realm_access: Joi.object()
      .keys({
        roles: Joi.array().items(Joi.string().min(1)).min(0).required(),
      })
      .required(),
  })
  .unknown(true);

export interface ExternalKKToken {
  sub: string;
  name: string;
  family_name?: string;
  given_name?: string;
  email?: string;
  tenantId?: null | string;
  groups: string[];
  realm_access: {
    roles: string[];
  };
  exp: number;
  iat: number;
  preferredLanguage?: string | null;
  preferred_username?: string | null;
}

export function decodeAndVerifyKeycloakToken(token: string | object | null): ExternalKKToken {
  let tokenData: ExternalKKToken | null = null;

  // Decode the token
  const tokenType = typeof token;
  if (tokenType === 'object' && tokenType !== null) {
    tokenData = token as ExternalKKToken;
  } else if (tokenType === 'string') {
    tokenData = decode(token as string) as unknown as ExternalKKToken;
  } else {
    tokenData = null; // We don't support this
  }

  if (!tokenData) {
    throw new UnauthorizedException(`Invalid token provided by IdP!`);
  }

  // Check if it contains all fields
  try {
    Joi.assert(tokenData, TokenSchema);
  } catch (ex) {
    console.error(`----`);
    console.error(`Failed to decode token from Keycloak: ${ex}`);
    console.error(`Keycloak might be not configured correctly!`);
    console.error(`Token:`, JSON.stringify(tokenData, null, 0));
    console.error(`----`);
    throw new UnauthorizedException(`Malformed token provided by IdP!`);
  }

  return tokenData;
}

/*

{
  "exp": 1645702259,
  "iat": 1645701959,
  "auth_time": 1645700924,
  "jti": "422636a5-ea0b-4b2b-a406-0bbdd8c7aac4",
  "iss": "https://development.shopfloor.io/auth/realms/shopfloor",
  "aud": "account",
  "sub": "c4211af0-dd23-44d7-ad79-bbe127c1b2fd",
  "typ": "Bearer",
  "azp": "oauth2-proxy",
  "session_state": "a026080d-f619-439a-931f-d20dab389bf8",
  "acr": "0",
  "realm_access": {
    "roles": [
      "urn:sio:right:ad:use",
      "urn:sio:right:user:roles",
      "urn:sio:right:mm:use",
      "urn:sio:right:user:delete",
      "urn:sio:right:tenant:use",
      "urn:sio:right:cm:edit",
      "urn:sio:right:asset:hierarchy",
      "urn:sio:right:tenant:create",
      "urn:sio:right:asset:type",
      "urn:sio:right:general:user",
      "offline_access",
      "uma_authorization",
      "urn:sio:right:cm:use",
      "urn:sio:right:asset:asset:delete:self",
      "urn:sio:right:user:edit",
      "urn:sio:role:super-admin",
      "urn:sio:right:asset:asset:create",
      "urn:sio:right:user:use",
      "urn:sio:right:asset:use",
      "urn:sio:right:grafana:use",
      "urn:sio:right:asset:asset:edit:self",
      "urn:sio:right:hub:use",
      "urn:sio:right:hub:edit",
      "default-roles-shopfloor",
      "urn:sio:right:asset:asset:edit",
      "urn:sio:right:user:create",
      "urn:sio:right:user:edit:self",
      "urn:sio:right:asset:asset:delete"
    ]
  },
  "resource_access": {
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links",
        "view-profile"
      ]
    }
  },
  "scope": "openid profile email",
  "sid": "a026080d-f619-439a-931f-d20dab389bf8",
  "email_verified": true,
  "tenantId": "0bfd22e4-88c5-4f73-bcdb-6bb4ae9aa7ed",
  "name": "elunic Admin",
  "sio-roles": [
    "urn:sio:right:ad:use",
    "urn:sio:right:user:roles",
    "urn:sio:right:mm:use",
    "urn:sio:right:user:delete",
    "urn:sio:right:tenant:use",
    "urn:sio:right:cm:edit",
    "urn:sio:right:asset:hierarchy",
    "urn:sio:right:tenant:create",
    "urn:sio:right:asset:type",
    "urn:sio:right:general:user",
    "offline_access",
    "uma_authorization",
    "urn:sio:right:cm:use",
    "urn:sio:right:asset:asset:delete:self",
    "urn:sio:right:user:edit",
    "urn:sio:role:super-admin",
    "urn:sio:right:asset:asset:create",
    "urn:sio:right:user:use",
    "urn:sio:right:asset:use",
    "urn:sio:right:grafana:use",
    "urn:sio:right:asset:asset:edit:self",
    "urn:sio:right:hub:use",
    "urn:sio:right:hub:edit",
    "default-roles-shopfloor",
    "urn:sio:right:asset:asset:edit",
    "urn:sio:right:user:create",
    "urn:sio:right:user:edit:self",
    "urn:sio:right:asset:asset:delete"
  ],
  "groups": [
    "/tenant/0bfd22e4-88c5-4f73-bcdb-6bb4ae9aa7ed",
    "/tenant/8e640e8c-12e2-4725-b16a-c6ba889c5fb1"
  ],
  "preferred_username": "elunic_admin",
  "given_name": "elunic",
  "family_name": "Admin",
  "email": "technik@elunic.de"
}

*/
