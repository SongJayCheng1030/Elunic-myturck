import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeviceDto } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';
import { EnvironmentService } from '.';

@Injectable({
  providedIn: 'root',
})
export class DevicesService {
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

  listDevices(): Observable<DeviceDto[]> {
    const url = urlJoin(this.environment.conditionMonitoringServiceUrl, '/v1/devices/registered');
    return this.http.get<DataResponse<DeviceDto[]>>(url).pipe(map(res => res.data));
  }

  getDeviceIds(): Observable<string[]> {
    const url = this.getEndpointUrl('v1/devices/available');
    return from(this.http.get<DataResponse<string[]>>(url)).pipe(map(res => res.data));
  }

  findSensors(q?: string): Observable<any> {
    const url = this.getEndpointUrl(`v1/devices/sensors`);
    const params = new HttpParams({ fromObject: q ? { q } : {} });
    return from(this.http.get<DataResponse<any>>(url, { params })).pipe(map(res => res.data));
  }

  createDevice(deviceId: string): Promise<any> {
    const url = this.getEndpointUrl(`v1/devices/available/${deviceId}/register`);
    return from(this.http.post<DataResponse<any>>(url, {})).toPromise();
  }

  getOneByAssetId(assetId: string): Observable<DeviceDto | undefined> {
    const url = this.getEndpointUrl(`v1/devices/registered/asset/${assetId}`);
    return this.http.get<DataResponse<DeviceDto>>(url).pipe(map(response => response.data));
  }

  assignDevice(deviceId: string, assetId: string): Observable<DeviceDto> {
    const url = this.getEndpointUrl(`v1/devices/registered/${deviceId}/assign/${assetId}`);
    return this.http.put<DataResponse<DeviceDto>>(url, {}).pipe(map(response => response.data));
  }

  unassignDevice(deviceId: string): Observable<DeviceDto> {
    const url = this.getEndpointUrl(`v1/devices/registered/${deviceId}/unassign`);
    return this.http.put<DataResponse<DeviceDto>>(url, {}).pipe(map(response => response.data));
  }
}
