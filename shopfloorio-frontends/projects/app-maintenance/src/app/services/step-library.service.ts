import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CondOperator, RequestQueryBuilder } from '@rewiko/crud-request';
import { EnvironmentService } from '@sio/common';
import { ToastrService } from 'ngx-toastr';
import { catchError, firstValueFrom, map } from 'rxjs';
import {
  CreateMaintenanceProcedureLibraryStepDto,
  MaintenanceProcedureLibraryStepDto,
  StepTagsDto,
  UpdateMaintenanceProcedureLibraryStepDto,
} from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class MntStepLibraryService extends ApiBaseService {
  constructor(
    private readonly environment: EnvironmentService,
    private http: HttpClient,
    toastrService: ToastrService,
    translate: TranslateService,
  ) {
    super(toastrService, translate);
  }

  createLibraryStep(
    dto: CreateMaintenanceProcedureLibraryStepDto,
  ): Promise<MaintenanceProcedureLibraryStepDto> {
    const url = urlJoin(this.environment.maintenanceServiceUrl, 'v1/procedure-steps');
    return firstValueFrom(
      this.http.post<DataResponse<MaintenanceProcedureLibraryStepDto>>(url, dto).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }

  updateLibraryStep(
    stepId: string,
    dto: UpdateMaintenanceProcedureLibraryStepDto,
  ): Promise<MaintenanceProcedureLibraryStepDto> {
    const url = urlJoin(this.environment.maintenanceServiceUrl, 'v1/procedure-steps', stepId);
    return firstValueFrom(
      this.http.put<DataResponse<MaintenanceProcedureLibraryStepDto>>(url, dto).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }

  deleteLibraryStep(stepId: string): Promise<void> {
    const url = urlJoin(this.environment.maintenanceServiceUrl, 'v1/procedure-steps', stepId);
    return firstValueFrom(
      this.http.delete<DataResponse<void>>(url).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }

  getLibrarySteps(q?: string, tags?: string[]): Promise<MaintenanceProcedureLibraryStepDto[]> {
    const qb = RequestQueryBuilder.create();
    if (q) {
      qb.search({ name: { $contL: q } });
    }
    if (tags && tags.length) {
      qb.setFilter({ field: 'tags.name', value: tags, operator: CondOperator.IN });
    }

    const url = urlJoin(this.environment.maintenanceServiceUrl, 'v1/procedure-steps');

    return firstValueFrom(
      this.http
        .get<DataResponse<MaintenanceProcedureLibraryStepDto[]>>(url, { params: qb.queryObject })
        .pipe(
          map(res => res.data),
          catchError(error => this.handleError(error)),
        ),
    );
  }

  listStepTags(): Promise<StepTagsDto[]> {
    const url = urlJoin(this.environment.maintenanceServiceUrl, 'v1/step-tags');
    return firstValueFrom(
      this.http.get<DataResponse<StepTagsDto[]>>(url, {}).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }
}
