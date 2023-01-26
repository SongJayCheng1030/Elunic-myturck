import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataResponse } from 'shared/common/response';

import { Settings } from '../models';

@Injectable({ providedIn: 'root' })
export class ConfigManagementService {
  cachedSettings!: Settings[] | null;

  constructor(private httpClient: HttpClient) {}

  getEndpointUrl(endpoint: string): string {
    return new URL(`/service/condition-monitoring/${endpoint}`, window.location.origin).href;
  }

  getSettings(force = false): Observable<Settings[]> {
    if (this.cachedSettings && !force) {
      return of(this.cachedSettings);
    }
    return this.httpClient.get<DataResponse<Settings[]>>(this.getEndpointUrl('v1/settings')).pipe(
      map(resp => {
        this.cachedSettings = resp.data;
        return resp.data || [];
      }),
    );
  }

  updateSettings(key: string, value: any): Observable<any> {
    return this.httpClient.put<DataResponse<any>>(this.getEndpointUrl('v1/settings'), {
      [key]: value,
    });
  }
}
