import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';

import { ActiveAppFacade } from '../models';
import { Logger } from '../util/logger';

@Injectable({
  providedIn: 'root',
})
export class SharedConditionMonitoringService {
  private logger = new Logger(`SharedConditionMonitoringService`);

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Returns the base URL of the condition monitoring backend service
   * as defined and specified inside the SIO main README.md
   */
  get apiBaseUrl(): string {
    return new URL(`/service/condition-monitoring/`, window.location.origin).href;
  }

  getEndpointUrl(endpoint: string): string {
    return urlJoin(this.apiBaseUrl, endpoint);
  }

  getFacades$(): Observable<ActiveAppFacade[]> {
    const url = this.getEndpointUrl('v1/facades');
    this.logger.trace(`getFacades$: url=${url}`);

    return this.httpClient
      .get<DataResponse<ActiveAppFacade[]>>(url)
      .pipe(map(resp => resp.data.map(f => ({ ...f, path: f.urlPath }))));
  }
}
