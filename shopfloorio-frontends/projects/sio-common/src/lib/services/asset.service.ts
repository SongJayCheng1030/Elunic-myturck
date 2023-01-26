import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CondOperator, RequestQueryBuilder } from '@rewiko/crud-request';
import { from, Observable, of, zip } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import {
  ActivityLog,
  AssetAliasDto,
  AssetAliasType,
  AssetDto,
  AssetImageMapDto,
  AssetTreeNodeDto,
  AssetTypeDto,
  UnitedPropertyDto,
} from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';

import { EnvironmentService } from '.';

@Injectable({ providedIn: 'root' })
export class AssetService {
  constructor(
    protected readonly http: HttpClient,
    private readonly environment: EnvironmentService,
  ) {}

  getEndpointUrl(endpoint: string): string {
    return urlJoin(this.environment.assetServiceUrl, '/v1', endpoint);
  }

  async getAssetTypeProperties(id: string): Promise<UnitedPropertyDto[]> {
    const { data } = (await this.http
      .get<DataResponse<UnitedPropertyDto[]>>(this.getEndpointUrl(`properties/asset-type/${id}`))
      .toPromise()) as DataResponse<UnitedPropertyDto[]>;
    return data;
  }

  async getAssetTypes(): Promise<AssetTypeDto[]> {
    const { data } = (await this.http
      .get<DataResponse<AssetTypeDto[]>>(this.getEndpointUrl('asset-types'))
      .toPromise()) as DataResponse<AssetTypeDto[]>;
    return data;
  }

  async getAssetImageMaps(): Promise<AssetImageMapDto[]> {
    const { data } = (await this.http
      .get<DataResponse<AssetImageMapDto[]>>(this.getEndpointUrl('asset-image-map'))
      .toPromise()) as DataResponse<AssetImageMapDto[]>;
    return data;
  }

  async getAssetImageMap(id: string): Promise<AssetImageMapDto> {
    const { data } = (await this.http
      .get<DataResponse<AssetImageMapDto>>(this.getEndpointUrl(`asset-image-map/${id}`))
      .toPromise()) as DataResponse<AssetImageMapDto>;
    return data;
  }

  async getAssetType(id: string): Promise<AssetTypeDto> {
    const { data } = (await this.http
      .get<DataResponse<AssetTypeDto>>(this.getEndpointUrl(`asset-types/${id}`))
      .toPromise()) as DataResponse<AssetTypeDto>;
    return data;
  }

  async getAssetActivities(id: string): Promise<ActivityLog[]> {
    const { data } = (await this.http
      .get<DataResponse<ActivityLog[]>>(this.getEndpointUrl('activity-logs'), {
        params: {
          refId: id,
          objectType: 'asset',
        },
      })
      .toPromise()) as DataResponse<ActivityLog[]>;
    return data;
  }

  async getAll(typeId?: string): Promise<AssetDto[]> {
    const qb = RequestQueryBuilder.create();
    if (typeId) {
      qb.setFilter({
        field: 'assetType.id',
        operator: CondOperator.EQUALS,
        value: typeId,
      });
    }
    const { data } = (await this.http
      .get<DataResponse<AssetDto[]>>(this.getEndpointUrl(`assets?${qb.query()}`))
      .toPromise()) as DataResponse<AssetDto[]>;
    return data;
  }

  async getAsset(id: string): Promise<AssetDto> {
    const { data } = (await this.http
      .get<DataResponse<AssetDto>>(this.getEndpointUrl(`assets/${id}`))
      .toPromise()) as DataResponse<AssetDto>;
    return data;
  }

  async getAssetByAlias(alias: string): Promise<AssetDto[]> {
    const { data } = (await this.http
      .get<DataResponse<AssetDto[]>>(this.getEndpointUrl(`assets/by-alias/${alias}`))
      .toPromise()) as DataResponse<AssetDto[]>;
    return data;
  }

  async getAssetAliasByType(type: AssetAliasType): Promise<AssetAliasDto[]> {
    const { data } = (await this.http
      .get<DataResponse<AssetAliasDto[]>>(this.getEndpointUrl(`assets/alias/${type}`))
      .toPromise()) as DataResponse<AssetAliasDto[]>;
    return data;
  }

  async getAssetTree(): Promise<AssetTreeNodeDto[]> {
    const { data } = (await this.http
      .get<DataResponse<AssetTreeNodeDto[]>>(this.getEndpointUrl('tree'))
      .toPromise()) as DataResponse<AssetTreeNodeDto[]>;
    return data;
  }

  async getAssetProperties(id: string): Promise<UnitedPropertyDto[]> {
    const { data } = (await this.http
      .get<DataResponse<UnitedPropertyDto[]>>(this.getEndpointUrl(`properties/asset/${id}`))
      .toPromise()) as DataResponse<UnitedPropertyDto[]>;
    return data;
  }

  async getUnassignedAssets(): Promise<AssetDto[]> {
    const { data } = (await this.http
      .get<DataResponse<AssetDto[]>>(this.getEndpointUrl('assets/unassigned'))
      .toPromise()) as DataResponse<AssetDto[]>;
    return data;
  }

  async transform(id: string, parentId: string | null, order?: string[]): Promise<void> {
    const action = { id, type: 'childOf', childOf: parentId, order };
    await this.http
      .post<DataResponse<void>>(this.getEndpointUrl('tree/transform'), {
        actions: [action],
      })
      .toPromise();
  }

  async transformMany(ids: string[], parentId: string | null, order?: string[]): Promise<void> {
    const actions = ids.map(id => ({ id, type: 'childOf', childOf: parentId, order }));
    await this.http
      .post<DataResponse<void>>(this.getEndpointUrl('tree/transform'), { actions })
      .toPromise();
  }

  async updateAsset(id: string, asset: Partial<AssetDto>): Promise<AssetDto> {
    const { data } = (await this.http
      .patch<DataResponse<AssetDto>>(this.getEndpointUrl(`assets/${id}`), asset)
      .toPromise()) as DataResponse<AssetDto>;
    return data;
  }

  async updateAssetProperty(
    assetId: string,
    propertyId: string,
    propertyData: Partial<UnitedPropertyDto>,
  ): Promise<UnitedPropertyDto> {
    const { data } = (await this.http
      .patch<DataResponse<UnitedPropertyDto>>(
        this.getEndpointUrl(`properties/${propertyId}/asset/${assetId}`),
        propertyData,
      )
      .toPromise()) as DataResponse<UnitedPropertyDto>;

    return data;
  }

  async createAsset(asset: Partial<AssetDto>): Promise<AssetDto> {
    const { data } = (await this.http
      .post<DataResponse<AssetDto>>(this.getEndpointUrl(`assets`), asset)
      .toPromise()) as DataResponse<AssetDto>;
    return data;
  }

  async cloneAsset(id: string): Promise<AssetDto> {
    const { data } = (await this.http
      .post<DataResponse<AssetDto>>(this.getEndpointUrl(`assets/clone/${id}`), {})
      .toPromise()) as DataResponse<AssetDto>;
    return data;
  }

  async updateAssetType(id: string, assetType: Partial<AssetTypeDto>): Promise<AssetTypeDto> {
    const { data } = (await this.http
      .patch<DataResponse<AssetTypeDto>>(this.getEndpointUrl(`asset-types/${id}`), assetType)
      .toPromise()) as DataResponse<AssetTypeDto>;
    return data;
  }

  async createAssetType(assetType: Partial<AssetTypeDto>): Promise<AssetTypeDto> {
    const { data } = (await this.http
      .post<DataResponse<AssetTypeDto>>(this.getEndpointUrl(`asset-types`), assetType)
      .toPromise()) as DataResponse<AssetTypeDto>;
    return data;
  }

  async updateAssetMap(assetMap: Partial<AssetImageMapDto>): Promise<AssetImageMapDto> {
    const { data } = (await this.http
      .patch<DataResponse<AssetImageMapDto>>(
        this.getEndpointUrl(`asset-image-map/${assetMap.id}`),
        assetMap,
      )
      .toPromise()) as DataResponse<AssetImageMapDto>;
    return data;
  }

  async createAssetMap(assetMap: Partial<AssetImageMapDto>): Promise<AssetImageMapDto> {
    const { data } = (await this.http
      .post<DataResponse<AssetImageMapDto>>(this.getEndpointUrl(`asset-image-map`), assetMap)
      .toPromise()) as DataResponse<AssetImageMapDto>;
    return data;
  }

  async setAssetMapToAsset(dto: { assetId: string; imageMapId?: string | null }): Promise<void> {
    await this.http
      .put<void>(this.getEndpointUrl(`asset-image-map/select-parent`), dto)
      .toPromise();
  }

  async updateAssetTypeProperty(
    propertyId: string,
    assetTypeId: string,
    property: Partial<UnitedPropertyDto>,
  ): Promise<UnitedPropertyDto> {
    const { data } = (await this.http
      .patch<DataResponse<UnitedPropertyDto>>(
        this.getEndpointUrl(`properties/${propertyId}/asset-type/${assetTypeId}`),
        property,
      )
      .toPromise()) as DataResponse<UnitedPropertyDto>;
    return data;
  }

  async createAssetTypeProperty(
    assetTypeId: string,
    property: Partial<UnitedPropertyDto>,
  ): Promise<UnitedPropertyDto> {
    const { data } = (await this.http
      .post<DataResponse<UnitedPropertyDto>>(
        this.getEndpointUrl(`properties/asset-type/${assetTypeId}`),
        property,
      )
      .toPromise()) as DataResponse<UnitedPropertyDto>;
    return data;
  }

  async deallocate(id: string, parentId: string | null): Promise<void> {
    const action = { id, type: 'delete', childOf: parentId };
    await this.http
      .post<DataResponse<void>>(this.getEndpointUrl('tree/transform'), {
        actions: [action],
      })
      .toPromise();
  }

  async deleteAsset(id: string): Promise<void> {
    await this.http.delete(this.getEndpointUrl(`assets/${id}`)).toPromise();
  }

  async deleteAssetType(id: string): Promise<void> {
    await this.http.delete(this.getEndpointUrl(`asset-types/${id}`)).toPromise();
  }

  async deleteAssetMap(id: string): Promise<void> {
    await this.http.delete(this.getEndpointUrl(`asset-image-map/${id}`)).toPromise();
  }

  async deleteAssetTypeProperty(propertyId: string, assetTypeId: string): Promise<void> {
    await this.http
      .delete(this.getEndpointUrl(`properties/${propertyId}/asset-type/${assetTypeId}`))
      .toPromise();
  }

  getAssetStatuses(): Observable<any> {
    return this.http
      .get<DataResponse<any>>('assets/mocks/asset-mocks/asset-status-badge.json')
      .pipe(map(res => res.data));
  }

  getAssetsWithRequiredProperty(propKey: string): Observable<AssetDto[]> {
    return zip(this.getAll(), this.getAssetTypes()).pipe(
      switchMap(async ([assets, assetTypes]) => {
        const assetTypesWithProps = await Promise.all(
          assetTypes.map(assetType =>
            this.getAssetTypeProperties(assetType.id).then(props => ({ ...assetType, props })),
          ),
        );

        const filteredTypes = assetTypesWithProps.filter(assetType =>
          assetType.props.some(p => p.key === propKey),
        );

        return assets.filter(a => filteredTypes.some(t => t.id === a.assetType.id));
      }),
    );
  }
}
