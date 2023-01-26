import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActiveAppFacade, GfDashboardItem, TileProperty } from '@sio/common';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DataResponse } from 'shared/common/response';

@Injectable({
  providedIn: 'root',
})
export class GrafanaBuildingSetService {
  private activeFacade?: ActiveAppFacade = undefined;
  private lastSelectedAssetId = '';
  constructor(private httpClient: HttpClient) {}

  set selectedAssetId(id: string) {
    this.lastSelectedAssetId = id;
  }

  get selectedAssetId() {
    return this.lastSelectedAssetId;
  }

  set facade(facade: ActiveAppFacade | undefined) {
    if (!facade || !facade.id || facade.id.length != 36) {
      console.warn('Invalid Facade ID for Grafana Tiles');
    }
    this.activeFacade = facade;
  }

  get facade() {
    return this.activeFacade as ActiveAppFacade;
  }

  private getServiceUrl(endpoint: string): string {
    return new URL(
      `/service/condition-monitoring/v1/gf-buildingset/${endpoint}`,
      window.location.origin,
    ).href;
  }

  getDashboardsGrouped$(): Observable<GfDashboardItem[]> {
    return this.httpClient
      .get<DataResponse<GfDashboardItem[]>>(this.getServiceUrl('gf/dashboards/grouped'))
      .pipe(map((m: any) => m.data));
  }

  getDashboards$(assetId: string): Observable<any[]> {
    return this.httpClient.get(this.getServiceUrl('gf/dashboards')).pipe(map((m: any) => m.data));
  }

  getDashboardPanels$(dashboardId: string): Observable<any[]> {
    return this.httpClient
      .get(this.getServiceUrl(`gf/dashboards/${dashboardId}/panels`))
      .pipe(map((m: any) => m.data));
  }

  createTile(assetTypeId: string, tileData: any): Observable<any> {
    return this.httpClient
      .post(this.getServiceUrl(`${this.facade?.id}/tiles/asset-type/${assetTypeId}`), tileData)
      .pipe(map((m: any) => m.data));
  }

  updateTile(tileId: string, assetId: string, tileData: any): Observable<TileProperty> {
    return this.httpClient
      .put<DataResponse<TileProperty>>(
        this.getServiceUrl(`${this.facade?.id}/tiles/${tileId}/asset/${assetId}`),
        tileData,
      )
      .pipe(map((m: any) => m.data));
  }

  deleteTile$(tileId: string): Observable<boolean> {
    return this.httpClient
      .delete<object>(this.getServiceUrl(`${this.facade?.id}/tiles/${tileId}`))
      .pipe(
        map(_ => true),
        catchError(err => {
          console.error(`Cannot delete tile:`, err);
          return of(false);
        }),
      );
  }

  getTilesByAssetId$(assetId: string): Observable<any[]> {
    return this.httpClient
      .get<any[]>(this.getServiceUrl(`${this.facade?.id}/tiles/asset/${assetId}`))
      .pipe(map((m: any) => m.data));
  }

  getTilesByAssetTypeId$(assetTypeId: string): Observable<any[]> {
    return this.httpClient
      .get<any[]>(this.getServiceUrl(`${this.facade?.id}/tiles/asset-type/${assetTypeId}`))
      .pipe(map((m: any) => m.data));
  }
}
