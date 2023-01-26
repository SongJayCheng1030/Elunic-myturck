import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EnvironmentService } from '@sio/common';
import { ToastrService } from 'ngx-toastr';
import { catchError, firstValueFrom, map, Subject } from 'rxjs';
import {
  CreateMaintenanceExecutionStepResultDto,
  MaintenanceExecutionDto,
  MaintenanceExecutionStepResultDto,
} from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';
import { ApiBaseService } from './api-base.service';

export interface FindExecutionsQuery {
  assetIds?: string[];
  completed?: boolean;
  limit?: number;
  page?: number;
}

@Injectable({ providedIn: 'root' })
export class MntExecutionService extends ApiBaseService {
  refreshSubject$ = new Subject<boolean>();

  constructor(
    private readonly environment: EnvironmentService,
    private http: HttpClient,
    toastrService: ToastrService,
    translate: TranslateService,
  ) {
    super(toastrService, translate);
  }

  getExecutions({ assetIds, completed, limit, page }: FindExecutionsQuery) {
    let params = new HttpParams();
    if (assetIds && assetIds.length) {
      for (const assetId of assetIds) {
        params = params.append('assetId', assetId);
      }
    }
    if (typeof completed === 'boolean') {
      params = params.append('completed', completed);
    }
    if (typeof limit === 'number') {
      params = params.append('limit', limit);
    }
    if (typeof page === 'number') {
      params = params.append('page', page);
    }

    const url = urlJoin(this.environment.maintenanceServiceUrl, 'v1/executions');
    return firstValueFrom(
      this.http
        .get<DataResponse<MaintenanceExecutionDto[]>>(url, { params })
        .pipe(map(res => res.data)),
    );
  }

  getExecution(id: string) {
    const url = urlJoin(this.environment.maintenanceServiceUrl, 'v1/executions', id);
    return firstValueFrom(
      this.http.get<DataResponse<MaintenanceExecutionDto>>(url).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }

  updateExecutionStep(id: string, stepId: string, dto: CreateMaintenanceExecutionStepResultDto) {
    const url = urlJoin(
      this.environment.maintenanceServiceUrl,
      'v1/executions',
      id,
      'steps',
      stepId,
    );
    return firstValueFrom(
      this.http.post<DataResponse<MaintenanceExecutionStepResultDto>>(url, dto).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }

  completeExecution(id: string) {
    const url = urlJoin(this.environment.maintenanceServiceUrl, 'v1/executions', id, 'complete');
    return firstValueFrom(
      this.http.post<DataResponse<MaintenanceExecutionDto>>(url, {}).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }
}
