/* eslint @typescript-eslint/explicit-module-boundary-typesno-use-before-define: 0 */
/* eslint @typescript-eslint/explicit-module-boundary-types: 0 */

import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@rewiko/crud';
import { Request } from 'express';
import * as Joi from 'joi';
import { JoiPipe } from 'nestjs-joi';
import { AssetAliasType } from 'shared/common/models';
import {
  ApiPaginationMeta,
  asResponse,
  DataResponse,
  getDataResponseForCrudMany,
  TenantIdAutoFilter,
} from 'shared/nestjs';

import { AssetHierarchyService } from '../asset-hierarchy/asset-hierarchy.service';
import { AssetHierarchyBuilder } from '../asset-hierarchy/asset-hierarchy-builder';
import {
  ENDPOINT_QUERY_CACHE_TIME,
  ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS,
  ENDPOINT_RESULT_QUERY_LIMIT,
} from '../definitions';
import { AssetEntity } from './asset.entity';
import { AssetService } from './asset.service';
import { AssetAliasEntity } from './asset-alias.entity';
import { AssetAliasDto, AssetClassDto, AssetDto } from './dto/AssetDto';
import {
  CreateAssetDtoClassRequest,
  CreateAssetDtoRequestSchema,
} from './dto/CreateAssetDtoRequest';
import {
  UpdateAssetDtoClassRequest,
  UpdateAssetDtoRequestSchema,
} from './dto/UpdateAssetDtoRequest';

@Crud({
  model: {
    type: AssetEntity,
  },
  query: {
    alwaysPaginate: true,
    limit: ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS,
    maxLimit: ENDPOINT_RESULT_QUERY_LIMIT,
    cache: ENDPOINT_QUERY_CACHE_TIME,
    filter: {
      deletedAt: {
        $isnull: '',
      },
    },
    join: {
      assetType: {
        eager: true,
      },
      imageMap: {
        eager: true,
      },
    },
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  validation: false,
  routes: {
    only: ['createOneBase', 'getManyBase', 'getOneBase', 'updateOneBase', 'deleteOneBase'],
  },
})
@Controller('assets')
@TenantIdAutoFilter()
@ApiTags('Assets Controller')
export class AssetController implements CrudController<AssetEntity> {
  constructor(public service: AssetService, private hierarchyService: AssetHierarchyService) {}

  get base(): CrudController<AssetEntity> {
    return this;
  }

  @Post('clone/:id')
  @ApiOperation({ summary: 'Clone Assets by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 201,
    description: 'Asset is cloned',
    type: AssetClassDto,
  })
  @ApiParam({ name: 'id', type: String })
  async cloneAsset(
    @Param('id') id: string,
    @Req() rawRequest: Request,
    @Body(new JoiPipe(UpdateAssetDtoRequestSchema)) dto: UpdateAssetDtoClassRequest,
  ): Promise<DataResponse<AssetDto>> {
    const clonedAsset = await this.service.cloneAssetById(rawRequest.auth, id, dto);
    return asResponse(AssetEntity.toExternal(clonedAsset));
  }

  /**
   * Returns a list of all assets which are not assigned to the tree
   * of assets, represented by `AssetHierarchyEntity`
   */
  @Get('unassigned')
  @ApiOperation({ summary: 'Get unassigned Assets' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({
    status: 200,
    description: 'Assets are provided',
    type: AssetClassDto,
    isArray: true,
  })
  async getUnassignedAssets(@Req() rawRequest: Request): Promise<DataResponse<AssetDto[]>> {
    // Compute a list of ids which are in the current hierarchy
    const tree = await this.hierarchyService.getAssetTree(rawRequest.auth);
    const ids = AssetHierarchyBuilder.getAllNodeIds(tree);

    // Fetch the assets
    const assets = await this.service.getAssetsWhereIdNotIn(rawRequest.auth, ids);
    return asResponse(assets.map(AssetEntity.toExternal));
  }

  /**
   * Finds an asset by alias. See `AssetAliasEntity` for more info
   *
   * @param alias The "name" of the alias
   */
  @Get('by-alias/:alias')
  @ApiOperation({ summary: 'Get Assets by alias' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Assets are provided',
    type: AssetClassDto,
    isArray: true,
  })
  @ApiParam({ name: 'alias', type: Number })
  async getAssetByAlias(
    @Req() rawRequest: Request,
    @Param('alias', new JoiPipe(Joi.string().min(1).max(32))) alias: string,
  ): Promise<DataResponse<AssetDto[]>> {
    const assets = await this.service.findAssetsByAlias(rawRequest.auth, alias);
    return asResponse(assets.map(AssetEntity.toExternal));
  }

  @Override()
  @ApiOperation({ summary: 'Create Asset' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({
    status: 201,
    description: 'Asset is created',
    type: AssetClassDto,
  })
  async createOne(
    @Body(new JoiPipe(CreateAssetDtoRequestSchema)) dto: CreateAssetDtoClassRequest,
    @Req() rewRequest: Request,
  ): Promise<DataResponse<AssetDto>> {
    const newAsset = await this.service.createAssetUnite(rewRequest.auth, dto);
    return asResponse(AssetEntity.toExternal(newAsset));
  }

  @Override()
  @ApiOperation({ summary: 'Get Assets' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({
    status: 200,
    description: 'Assets are provided',
    type: AssetClassDto,
    isArray: true,
  })
  async getMany(
    @ParsedRequest() req: CrudRequest,
  ): Promise<DataResponse<AssetDto[], ApiPaginationMeta>> {
    const ret = await this.base.getManyBase!(req);
    return getDataResponseForCrudMany<AssetEntity, AssetDto>(ret, AssetEntity.toExternal);
  }

  @Override()
  @ApiOperation({ summary: 'Get Asset by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Assets are provided',
    type: AssetClassDto,
  })
  @ApiParam({ name: 'id', type: String })
  async getOne(
    @Req() rawRequest: Request,
    @Param('id') id: string,
  ): Promise<DataResponse<AssetDto>> {
    // We use our own function here since it computes much
    // more than the nestjsx/crud query function
    const asset = await this.service.getAssetByIdOrFail(rawRequest.auth, id, true);
    return asResponse(AssetEntity.toExternal(asset));
  }

  @Get('alias/:type')
  @ApiOperation({ summary: 'Get Assets alias by type' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Assets alias are provided',
    type: AssetClassDto,
    isArray: true,
  })
  @ApiParam({ name: 'type', type: Number })
  async getAssetAliasByType(
    @Req() rawRequest: Request,
    @Param('type', new JoiPipe(Joi.string().required())) type: AssetAliasType,
  ): Promise<DataResponse<AssetAliasDto[]>> {
    const alias = (await this.service.getAssetAliasByType(rawRequest.auth, type)) || [];
    return asResponse(alias.map(alias => AssetAliasEntity.toExternal(alias)));
  }

  @Override()
  @ApiOperation({ summary: 'Update Assets' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Asset is updated',
    type: AssetClassDto,
  })
  @ApiParam({ name: 'id', type: String })
  async updateOne(
    @Body(new JoiPipe(UpdateAssetDtoRequestSchema)) dto: UpdateAssetDtoClassRequest,
    @Req() rawRequest: Request,
    @Param('id') id: string,
  ): Promise<DataResponse<AssetDto>> {
    const result = await this.service.updateAssetByIdUnite(rawRequest.auth, id, dto);
    return asResponse(AssetEntity.toExternal(result));
  }

  @Override()
  @ApiOperation({ summary: 'Delete Asset by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Assets are delete',
    type: AssetClassDto,
  })
  @ApiParam({ name: 'id', type: String })
  async deleteOne(@Param('id') id: string, @Req() rawRequest: Request) {
    await this.service.softDeleteById(rawRequest.auth, id);
  }
}
