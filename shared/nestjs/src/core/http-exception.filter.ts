/* eslint-disable no-console */
import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AlreadyInUseError,
  ArgumentError,
  ArgumentNullError,
  AuthenticationRequiredError,
  NotFoundError,
  NotPermittedError,
} from 'common-errors';
import { Response } from 'express';
import { asError } from 'shared/backend';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@InjectLogger(HttpExceptionFilter.name) private readonly logger: LogService) {}

  catch(err: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Don't clutter up the stdout with these use-less infos
    // @ts-ignore
    if ((err && err.status === 404) || err instanceof NotFoundException) {
      if (`${process.env.LOG_LEVEL || ''}`.toLowerCase() === 'trace') {
        console.log(`HTTP 404: ${err}`);
      }

      response.status(404).json({ error: `Not found: ${err.message}` });
      return;
    }

    if (this.logger) {
      this.logger.error([err, err.stack]);
    }

    let error: HttpException;
    if (err instanceof HttpException) {
      error = err;
    } else if (err instanceof ArgumentError || err instanceof ArgumentNullError) {
      error = new BadRequestException(err.message);
    } else if (err instanceof AlreadyInUseError) {
      error = new ConflictException(err.message);
    } else if (err instanceof AuthenticationRequiredError) {
      error = new UnauthorizedException(err.message);
    } else if (err instanceof NotFoundError) {
      error = new NotFoundException(err.message);
    } else if (err instanceof NotPermittedError) {
      error = new ForbiddenException(err.message);
    } else {
      error = new BadRequestException(err.message);
    }
    response.status(error.getStatus()).json({
      error: error.message,
    });
  }
}

@Catch(EntityNotFoundError, QueryFailedError)
export class TypeormExceptionFilter implements ExceptionFilter {
  constructor(@InjectLogger(HttpExceptionFilter.name) private readonly logger: LogService) {}

  catch(err: EntityNotFoundError | QueryFailedError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (err instanceof EntityNotFoundError) {
      const parsedMsg = err.message.split(' matching:');
      const notFoundError = new NotFoundException(parsedMsg[0]);
      response.status(notFoundError.getStatus()).json(asError(notFoundError.getResponse()));
      return;
    }

    if (err instanceof QueryFailedError && err.message.startsWith('ER_DUP_ENTRY')) {
      const parsedMsg = err.message.split(" '");
      const conflictError = new ConflictException(parsedMsg[0]);
      response.status(conflictError.getStatus()).json(asError(conflictError.getResponse()));
      return;
    }

    if (this.logger) {
      this.logger.error([err, err.stack]);
    }

    const internalError = new InternalServerErrorException(err.message);
    response.status(internalError.getStatus()).json(asError(internalError.getResponse()));
  }
}
