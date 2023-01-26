import { Logger } from '@elunic/logger';
import { INestApplication } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { Request, Response } from 'express';
import * as basicAuth from 'express-basic-auth';

import urlJoin = require('url-join');

export interface SwaggerModuleOptions {
  authEnabled: boolean;
  path: string;
  // Allowed to be empty if auth disabled
  authUser?: string;
  authPwd?: string;
}

const DEFAULT_OPTIONS: SwaggerModuleOptions = {
  authEnabled: false,
  path: '/docs',
};

export function addSwaggerModule(
  logger: Logger,
  app: INestApplication,
  api: Omit<OpenAPIObject, 'components' | 'paths'>,
  options: Partial<SwaggerModuleOptions> = {},
): void {
  const finalOptions: SwaggerModuleOptions = Object.assign({ ...DEFAULT_OPTIONS }, options);

  const document = SwaggerModule.createDocument(app, api);

  // Remove petstore entfernen
  // See https://github.com/scottie1984/swagger-ui-express/issues/94 (we don't have access to the underlying NestJS module)
  app
    .getHttpAdapter()
    .get(urlJoin(finalOptions.path, '/index.html'), (req: Request, res: Response) =>
      // Traefik unaccountably doesn't perform reverse rewrites when using StripPrefix.
      // Instead, we have to use X-Forwarded-Prefix.
      // See https://github.com/containous/traefik/issues/5809 and remove this workaround if fixed & possible.
      // The trailing slash is VERY important; without it, Express will redirect to the trailing slash URL,
      // which will fail because of the missing stripped path prefix.
      res.redirect(urlJoin(req.get('X-Forwarded-Prefix') || '/', urlJoin(finalOptions.path, '/'))),
    );

  if (finalOptions.authEnabled) {
    if (
      finalOptions.authUser?.startsWith('default') &&
      finalOptions.authPwd?.startsWith('default')
    ) {
      logger.info(
        `Swagger Authentication via user: ${finalOptions.authUser} and password: ${finalOptions.authPwd}`,
      );
    }

    app.use(
      finalOptions.path + '*',
      basicAuth({
        challenge: true,
        users:
          finalOptions.authUser && finalOptions.authPwd
            ? { [finalOptions.authUser]: finalOptions.authPwd }
            : {},
      }),
    );
  }

  SwaggerModule.setup(finalOptions.path, app, document);
}
