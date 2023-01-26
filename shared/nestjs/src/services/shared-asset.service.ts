import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BadRequest } from 'http-errors';
import * as Joi from 'joi';
import {
  AssetDto,
  AssetPropertyType,
  AssetTreeNodeDto,
  AssetTypeDto,
  CreateAssetTypeDto,
  UnitedPropertyDto,
} from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import { AuthInfo } from 'shared/common/types';

import { SharedApiService } from './shared-api.service';
import { SharedService } from './shared-service';

@Injectable()
export class SharedAssetService {
  constructor(private readonly sharedApiService: SharedApiService) {}

  async rawGet<T>(authInfo: AuthInfo, urlSegment: string): Promise<T> {
    const resp = await this.sharedApiService.httpGetOrFail<T>(
      authInfo,
      SharedService.ASSET_SERVICE,
      urlSegment,
    );
    return resp.data;
  }

  async rawPost<T, U>(authInfo: AuthInfo, urlSegment: string, payload: U): Promise<T> {
    const resp = await this.sharedApiService.httpPostOrFail<T>(
      authInfo,
      SharedService.ASSET_SERVICE,
      urlSegment,
      payload as unknown as { [key: string]: string | number | boolean | object },
    );
    return resp.data;
  }

  async rawPatch<T, U>(authInfo: AuthInfo, urlSegment: string, payload: U): Promise<T> {
    const resp = await this.sharedApiService.httpPatchOrFail<T>(
      authInfo,
      SharedService.ASSET_SERVICE,
      urlSegment,
      payload as unknown as { [key: string]: string | number | boolean | object },
    );
    return resp.data;
  }

  // ---

  async getTree(authInfo: AuthInfo): Promise<AssetTreeNodeDto[]> {
    try {
      const resp = await this.sharedApiService.httpGetOrFail<DataResponse<AssetTreeNodeDto[]>>(
        authInfo,
        SharedService.ASSET_SERVICE,
        `v1/tree`,
      );

      return resp.data.data;
    } catch (ex) {
      const httpStatus = (ex as unknown as { status?: number }).status || -1;

      if (httpStatus === 404) {
        throw new NotFoundException(`Asset tree not found`);
      } else if (httpStatus === 400) {
        throw new BadRequestException(`Invalid argument(s) provided`);
      }

      // Other error occurred
      throw ex;
    }
  }

  async getById(authInfo: AuthInfo, assetId: string): Promise<AssetDto> {
    try {
      Joi.assert(assetId, Joi.string().uuid().required());
    } catch (_) {
      throw new BadRequest(`Invalid asset id: ${assetId}`);
    }

    try {
      const resp = await this.sharedApiService.httpGetOrFail<DataResponse<AssetDto>>(
        authInfo,
        SharedService.ASSET_SERVICE,
        `v1/assets/${assetId}`,
        {},
        {},
        true,
      );

      return resp.data.data;
    } catch (ex) {
      if (ex.status === 404) {
        throw new NotFoundException(`No such asset`);
      } else if (ex.status === 400) {
        throw new BadRequestException(`Invalid argument(s) provided`);
      }

      // Other error occurred
      throw ex;
    }
  }

  async createAssetType(authInfo: AuthInfo, data: CreateAssetTypeDto): Promise<AssetTypeDto> {
    const resp = await this.sharedApiService.httpPostOrFail<DataResponse<AssetTypeDto>>(
      authInfo,
      SharedService.ASSET_SERVICE,
      `v1/asset-types`,
      data as unknown as { [key: string]: string | number | boolean | object },
    );
    return resp.data.data;
  }

  async transform(
    authInfo: AuthInfo,
    action: {
      id: string;
      type: string;
      childOf?: string | null;
      order?: string[] | undefined;
    },
  ): Promise<AssetTypeDto> {
    const resp = await this.sharedApiService.httpPostOrFail<DataResponse<AssetTypeDto>>(
      authInfo,
      SharedService.ASSET_SERVICE,
      `v1/tree/transform`,
      { actions: [action] } as unknown as { [key: string]: string | number | boolean | object },
    );
    return resp.data.data;
  }

  async getTypeById(authInfo: AuthInfo, typeId: string): Promise<AssetTypeDto> {
    try {
      Joi.assert(typeId, Joi.string().uuid().required());
    } catch (_) {
      throw new BadRequest(`Invalid asset id: ${typeId}`);
    }

    try {
      const resp = await this.sharedApiService.httpGetOrFail<DataResponse<AssetTypeDto>>(
        authInfo,
        SharedService.ASSET_SERVICE,
        `v1/asset-types/${typeId}`,
        {},
        {},
        true,
      );

      return resp.data.data;
    } catch (ex) {
      if (ex.status === 404) {
        throw new NotFoundException(`No such asset type`);
      } else if (ex.status === 400) {
        throw new BadRequestException(`Invalid argument(s) provided`);
      }

      // Other error occurred
      throw ex;
    }
  }

  async getPropertiesForAssetId(
    authInfo: AuthInfo,
    assetId: string,
    opts?: {
      withSubstitution?: boolean;
      filterKey?: string;
      filterType?: AssetPropertyType;
    },
  ): Promise<UnitedPropertyDto[]> {
    try {
      Joi.assert(assetId, Joi.string().uuid().required());
    } catch (_) {
      throw new BadRequest(`Invalid asset id: ${assetId}`);
    }

    try {
      const resp = await this.sharedApiService.httpGetOrFail<DataResponse<UnitedPropertyDto[]>>(
        authInfo,
        SharedService.ASSET_SERVICE,
        `v1/properties/asset/${assetId}`,
        {
          withSubstitution: opts ? opts.withSubstitution || false : false,
          ...(opts && opts.filterKey ? { filterKey: `${opts.filterKey}` } : {}),
          ...(opts && opts.filterType ? { filterType: `${opts.filterType}` } : {}),
        },
        {},
        true,
      );

      return Array.isArray(resp.data.data) ? resp.data.data : [];
    } catch (ex) {
      if (ex.status === 404) {
        throw new NotFoundException(`No such asset`);
      } else if (ex.status === 400) {
        throw new BadRequestException(`Invalid argument(s) provided`);
      }

      // Other error occurred
      throw ex;
    }
  }
}
