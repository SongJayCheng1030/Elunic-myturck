import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import * as Joi from 'joi';

dotenvExpand(dotenv.config());

export const AbstractConfigServiceSchema = Joi.object()
  .keys({
    apiDocs: Joi.object()
      .required()
      .keys({
        route: Joi.string().regex(/^\/[\w-_/]+[^/]$/),
        enabled: Joi.boolean().required(),
        auth: Joi.object().required().keys({
          enabled: Joi.boolean().required(),
        }),
      })
      .required(),

    authCookieName: Joi.string().required(),
  })
  .required();

export class AbstractConfigService {
  apiDocs = {
    route: '/docs',
    // Disable in production environments
    // Everywhere else, disable if and only if APP_APIDOCS_DISABLED is truthy
    enabled:
      process.env.NODE_ENV === 'production'
        ? false
        : process.env.APP_APIDOCS_DISABLED
        ? [1, '1', true, 'true'].includes(process.env.APP_APIDOCS_DISABLED)
          ? false
          : true
        : true,
    auth: {
      // During developement, enable
      // Everywhere else, enable if and only if APP_APIDOCS_AUTH_DISABLED is truthy
      enabled:
        process.env.NODE_ENV === 'development'
          ? false
          : process.env.APP_APIDOCS_AUTH_DISABLED
          ? [1, '1', true, 'true'].includes(process.env.APP_APIDOCS_AUTH_DISABLED)
            ? false
            : true
          : true,
    },
  };

  authCookieName = process.env.AUTH_COOKIE_NAME || '__sfio_session';
}
