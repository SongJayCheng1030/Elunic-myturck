import { TranslateService } from '@ngx-translate/core';
import { HttpError } from 'http-errors';
import { ToastrService } from 'ngx-toastr';
import { Observable, throwError } from 'rxjs';

export abstract class ApiBaseService {
  constructor(private toastrService: ToastrService, private translate: TranslateService) {}

  handleError(error: HttpError): Observable<never> {
    const message = error.error?.error?.message;

    this.toastrService.error(this.translate.instant(message || 'ERRORS.BACKEND_ERROR_MESSAGE'));
    return throwError(() => error);
  }
}
