import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Logger } from '../util';

const TENANT_SUBPATH = '/tenant/';

@Injectable()
export class NoTenantRedirectHttpInterceptor implements HttpInterceptor {
  private logger = new Logger(`NoTenantRedirectHttpInterceptor`);

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    request = request.clone({
      withCredentials: true,
    });
    return next.handle(request).pipe(
      catchError((err, event) => {
        if (err instanceof HttpErrorResponse) {
          this.handleNoTenantResponse(err.status, err.error);
        }
        throw err;
      }),
      map((event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse) {
          this.handleNoTenantResponse(event.status, event.body);
        }
        return event;
      }),
    );
  }

  handleNoTenantResponse(httpStatus: number, body: unknown) {
    // We don't care for any other error than HTTP 423
    if (httpStatus !== 423) {
      return;
    }

    this.logger.warn(
      `Received HTTP 423 response, indicating that the current user has no tenant:`,
      body,
    );

    // This should be replaced later by a more reliable mechanism,
    // e.g. the frontend can be detected by an other means
    if (window.location.href.includes(TENANT_SUBPATH)) {
      this.logger.warn(
        `Aborting redirect, because the user seems to be inside the tenant frontend`,
      );
      return;
    }

    if (typeof body === 'object' && !!(body as object)['redirectUrl']) {
      const redirectUrl = (body as object)['redirectUrl'] as string;
      this.logger.warn(`Received redirect url: ${redirectUrl}. Redirecting ...`);
      window.location.href = redirectUrl;
    } else {
      this.logger.error(`Received no redirect url. Guessing the right one ...`);
      window.location.href = new URL(TENANT_SUBPATH, window.location.origin).href;
    }
  }
}
