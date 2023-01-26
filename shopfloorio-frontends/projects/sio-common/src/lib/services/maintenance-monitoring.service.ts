import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataResponse } from 'shared/common/response';

@Injectable({ providedIn: 'root' })
export class MaintenanceMonitoringService {
  constructor(private readonly http: HttpClient) {}

  getAlarmAnalytics(): Observable<any> {
    return from(
      this.http.get<DataResponse<any>>(
        'assets/mocks/maintenance-monitoring-mocks/alarm-analytics.json',
      ),
    ).pipe(map(res => res.data));
  }

  getComponentAnalytics(): Observable<any> {
    return from(
      this.http.get<DataResponse<any>>(
        'assets/mocks/maintenance-monitoring-mocks/component-analytics.json',
      ),
    ).pipe(map(res => res.data));
  }

  getComponent(id: string): Observable<any> {
    return from(
      this.http.get<DataResponse<any>>(
        'assets/mocks/maintenance-monitoring-mocks/component-analytics.json',
      ),
    ).pipe(map(res => res.data.find((entry: any) => entry.id === id)));
  }
}
