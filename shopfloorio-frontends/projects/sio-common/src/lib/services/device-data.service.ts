import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CurrentValueAndMachineVariableDto } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';
import { EnvironmentService } from '.';

@Injectable({
  providedIn: 'root',
})
export class DeviceDataService {
  constructor(
    private readonly http: HttpClient,
    private readonly environment: EnvironmentService,
  ) {}

  get apiBaseUrl(): string {
    return new URL(`/service/condition-monitoring/`, window.location.origin).href;
  }

  getEndpointUrl(endpoint: string): string {
    return urlJoin(this.apiBaseUrl, endpoint);
  }

  getMachineVariableAndCurrentValue(assetId: string, machineVariableId: string): Observable<CurrentValueAndMachineVariableDto> {
    const url = urlJoin(this.environment.conditionMonitoringServiceUrl, `/v1/data/current/${assetId}/machine-variable/${machineVariableId}/`);
    return this.http.get<DataResponse<CurrentValueAndMachineVariableDto>>(url).pipe(map(res => res.data));
  }
}
