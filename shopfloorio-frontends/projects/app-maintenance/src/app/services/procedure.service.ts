import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CondOperator, RequestQueryBuilder } from '@rewiko/crud-request';
import { EnvironmentService } from '@sio/common';
import { ToastrService } from 'ngx-toastr';
import { catchError, firstValueFrom, map, Observable } from 'rxjs';
import {
  CreateMaintenanceProcedureDto,
  MaintenanceAssignmentDto,
  MaintenanceProcedureDto,
  UpdateMaintenanceProcedureDto,
} from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class MntProcedureService extends ApiBaseService {
  constructor(
    private readonly environment: EnvironmentService,
    private http: HttpClient,
    toastrService: ToastrService,
    translate: TranslateService,
  ) {
    super(toastrService, translate);
  }

  createProcedure(dto: CreateMaintenanceProcedureDto): Promise<MaintenanceProcedureDto> {
    const url = urlJoin(this.environment.maintenanceServiceUrl, 'v1/procedures');
    return firstValueFrom(
      this.http.post<DataResponse<MaintenanceProcedureDto>>(url, dto).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }

  updateProcedure(
    id: string,
    dto: UpdateMaintenanceProcedureDto,
  ): Promise<MaintenanceProcedureDto> {
    const url = urlJoin(this.environment.maintenanceServiceUrl, `v1/procedures/${id}`);
    return firstValueFrom(
      this.http.put<DataResponse<MaintenanceProcedureDto>>(url, dto).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }

  getProcedures(assetTypeId?: string): Observable<MaintenanceProcedureDto[]> {
    const qb = RequestQueryBuilder.create();
    if (assetTypeId) {
      qb.setFilter({ field: 'assetTypeId', value: assetTypeId, operator: CondOperator.EQUALS });
    }

    const url = urlJoin(this.environment.maintenanceServiceUrl, 'v1/procedures');

    return this.http
      .get<DataResponse<MaintenanceProcedureDto[]>>(url, { params: qb.queryObject })
      .pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      );
  }

  getProcedure(id: string): Promise<MaintenanceProcedureDto> {
    const url = urlJoin(this.environment.maintenanceServiceUrl, 'v1/procedures', id);
    return firstValueFrom(
      this.http.get<DataResponse<MaintenanceProcedureDto>>(url).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }

  deleteProcedure(id: string): Promise<void> {
    const url = urlJoin(this.environment.maintenanceServiceUrl, 'v1/procedures', id);
    return firstValueFrom(
      this.http.delete<DataResponse<void>>(url).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }

  getProcedureAssignments(id: string): Promise<MaintenanceAssignmentDto[]> {
    const url = urlJoin(this.environment.maintenanceServiceUrl, 'v1/procedures', id, 'assignments');
    return firstValueFrom(
      this.http.get<DataResponse<MaintenanceAssignmentDto[]>>(url).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }

  assignProcedure(id: string, assetId: string): Promise<MaintenanceAssignmentDto> {
    const url = urlJoin(
      this.environment.maintenanceServiceUrl,
      'v1/procedures',
      id,
      'assign',
      assetId,
    );
    return firstValueFrom(
      this.http.post<DataResponse<MaintenanceAssignmentDto>>(url, {}).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }

  unassignProcedure(id: string, assetId: string): Promise<void> {
    const url = urlJoin(
      this.environment.maintenanceServiceUrl,
      'v1/procedures',
      id,
      'unassign',
      assetId,
    );
    return firstValueFrom(
      this.http.delete<DataResponse<void>>(url).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }

  getAssignments(id: string): Promise<MaintenanceAssignmentDto[]> {
    const url = urlJoin(this.environment.maintenanceServiceUrl, 'v1/procedures', id, 'assignments');
    return firstValueFrom(
      this.http.get<DataResponse<MaintenanceAssignmentDto[]>>(url).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }
}
