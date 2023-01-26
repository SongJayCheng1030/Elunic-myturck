import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AssetDto, AssetGroupDto, AssetTreeNodeDto } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';

import { Logger } from '../util/logger';

@Injectable({
  providedIn: 'root',
})
export class SharedAssetService {
  private readonly logger: Logger = new Logger('SharedAssetService');

  constructor(private readonly httpClient: HttpClient) {}

  getEndpointUrl(endpoint: string): string {
    return new URL(`/service/asset/${endpoint}`, window.location.origin).href;
  }

  get assetTree$(): Observable<AssetTreeNodeDto[]> {
    return this.httpClient
      .get<DataResponse<AssetTreeNodeDto[]>>(this.getEndpointUrl(`v1/tree`))
      .pipe(map(resp => resp.data));
  }

  get assetGroups$(): Observable<AssetGroupDto[]> {
    return this.httpClient
      .get<DataResponse<AssetGroupDto[]>>(this.getEndpointUrl(`v1/asset-groups`))
      .pipe(map(resp => resp.data));
  }

  getById(id: string): Observable<AssetDto> {
    return this.httpClient
      .get<DataResponse<AssetDto>>(this.getEndpointUrl(`v1/assets/${id}`))
      .pipe(map(resp => resp.data));
  }
}
