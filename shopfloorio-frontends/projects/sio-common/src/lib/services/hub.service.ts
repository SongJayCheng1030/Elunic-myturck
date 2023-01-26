import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TileConfigurationDto } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';

import { EnvironmentService } from '.';

/**
 
TODO: possibly mix in:
 
const HUB_TILE: TileConfigurationDto = {
  id: 0,
  tileName: 'Hub',
  desc: 'Hub',
  appUrl: !this.environment.production ? 'http://localhost:13106' : 'hub',
  iconUrl: '',
  tileColor: '#ffffff',
  tileTextColor: '#000000',
  order: 1,
  show: 1,
  integratedView: false,
};
 
 
 
 */

@Injectable({
  providedIn: 'root',
})
export class HubService {
  tiles = new BehaviorSubject<TileConfigurationDto[]>([]);
  tiles$ = this.tiles.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly environment: EnvironmentService,
  ) {}

  getEndpointUrl(endpoint: string): string {
    return urlJoin(this.environment.hubServiceUrl, endpoint);
  }

  setTiles(tiles: TileConfigurationDto[]) {
    this.tiles.next(tiles);
  }

  initTiles(): Observable<TileConfigurationDto[]> {
    return this.httpClient
      .get<DataResponse<TileConfigurationDto[]>>(this.getEndpointUrl('tile-configuration'))
      .pipe(
        catchError(() => of({ data: [] })),
        map(resp => {
          const data = resp.data || [];
          this.setTiles(data);
          return data;
        }),
      );
  }
}
