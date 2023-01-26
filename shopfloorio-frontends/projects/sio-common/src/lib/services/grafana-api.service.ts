import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataResponse } from 'shared/common/response';

import { TileProperty } from '../models';

@Injectable({ providedIn: 'root' })
export class GrafanaApiService {
  constructor(private readonly http: HttpClient) {}

  getGrafanaPanels(): Observable<TileProperty[]> {
    return this.http
      .get<DataResponse<TileProperty[]>>(
        'assets/mocks/grafana-building-set-mocks/grafana-panels.json',
      )
      .pipe(map(res => res.data));
  }

  getGrafanaOptions(): Observable<any> {
    return this.http
      .get<DataResponse<TileProperty[]>>(
        'assets/mocks/grafana-building-set-mocks/grafana-options.json',
      )
      .pipe(map(res => res.data));
  }
}
