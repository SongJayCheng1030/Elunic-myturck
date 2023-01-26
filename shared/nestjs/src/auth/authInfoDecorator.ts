/* eslint-disable no-console */
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthInfo } from 'shared/common/types';

/**
 * Returns the `AuthInfo` object for the current request to be further
 * used. This decorator also ensures that a `AuthInfo` object is available
 * on the request. If for any reason this object is not available the
 * request is directly terminated with a HTTP 401.
 */
export const Auth = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthInfo => {
  const request = ctx.switchToHttp().getRequest() as Request;
  const auth = request.auth;

  if (!auth || typeof auth !== 'object' || !auth.id) {
    console.error(
      `The route ${request.method} ${request.url} is annotated with @Auth but the token is missing on req.auth:`,
      auth,
    );
    console.error(`Maybe your configuration is invalid or the auth middleware is not active ?!`);
    throw new UnauthorizedException(`User authorization is missing.`);
  }

  return auth;
});
