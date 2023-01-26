import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentService } from '@sio/common';
import { map, Observable } from 'rxjs';
import { GroupDto, TenantSettingsDto, TENANT_DEVICE_GROUP_SETTING_KEY } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';

@Injectable({
  providedIn: 'root',
})
export class TenantSettingsService {
  constructor(private http: HttpClient, private readonly environment: EnvironmentService) {}

  updateTenantSettingsByKey(
    tenantId: string,
    key: string,
    value: string,
  ): Observable<TenantSettingsDto> {
    return this.http
      .put<DataResponse<TenantSettingsDto>>(
        `${this.environment.tenantServiceUrl}tenant-settings/${tenantId}/${key}`,
        { value },
      )
      .pipe(map(res => res.data));
  }

  getAvailableGroups(): Observable<GroupDto[]> {
    return this.http
      .get<DataResponse<GroupDto[]>>(
        `${this.environment.tenantServiceUrl}tenant-settings/${TENANT_DEVICE_GROUP_SETTING_KEY}/options`,
      )
      .pipe(map(res => res.data));
  }

  getGroupByTenantId(tenantId: string): Observable<GroupDto> {
    return this.http
      .get<DataResponse<GroupDto>>(
        `${this.environment.tenantServiceUrl}tenant-settings/${tenantId}/c8y-group`,
      )
      .pipe(map(res => res.data));
  }
}
