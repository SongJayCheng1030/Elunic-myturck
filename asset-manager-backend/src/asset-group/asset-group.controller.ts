import { Body, Controller, Param, Put, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@rewiko/crud';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import {
  ApiPaginationMeta,
  asResponse,
  DataResponse,
  getDataResponseForCrudMany,
  TenantIdAutoFilter,
} from 'shared/nestjs';

import {
  ENDPOINT_QUERY_CACHE_TIME,
  ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS,
  ENDPOINT_RESULT_QUERY_LIMIT,
} from '../definitions';
import { AssetGroupEntity } from './asset-group.entity';
import { AssetGroupService } from './asset-group.service';
import { AssetGroupClassDto, AssetGroupDto, toExternal } from './dto/AssetGroupDto';
import {
  CreateUpdateAssetGroupDtoRequest,
  CreateUpdateAssetGroupDtoRequestSchema,
} from './dto/CreateAssetGroupDtoRequest';

@Crud({
  model: {
    type: AssetGroupEntity,
  },
  query: {
    alwaysPaginate: true,
    limit: ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS,
    maxLimit: ENDPOINT_RESULT_QUERY_LIMIT,
    cache: ENDPOINT_QUERY_CACHE_TIME,
    filter: {},
    join: { assets: { eager: true } },
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
@Controller('asset-groups')
@TenantIdAutoFilter()
@ApiTags('Asset Groups Controller')
export class AssetGroupController implements CrudController<AssetGroupEntity> {
  constructor(public service: AssetGroupService) {}

  get base(): CrudController<AssetGroupEntity> {
    return this;
  }
  @ApiOperation({ summary: 'Add Asset to group' })
  @Put(':groupId/add/:assetId')
  async addAsset(@Param('groupId') groupId: string, @Param('assetId') assetId: string) {
    return await this.service.addAsset(groupId, assetId);
  }
  @ApiOperation({ summary: 'Remove Asset from group' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @Put(':groupId/remove/:assetId')
  async removeAsset(@Param('groupId') groupId: string, @Param('assetId') assetId: string) {
    return await this.service.removeAsset(groupId, assetId);
  }

  @Override()
  @ApiOperation({ summary: 'Create Asset Group' })
  @ApiBody({ type: AssetGroupClassDto })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({
    status: 201,
    description: 'Asset Group is created',
    type: AssetGroupClassDto,
  })
  async createOne(
    @Body(new JoiPipe(CreateUpdateAssetGroupDtoRequestSchema))
    dto: CreateUpdateAssetGroupDtoRequest,
    @Req() rawRequest: Request,
  ): Promise<DataResponse<AssetGroupDto>> {
    const newAssetGroup = await this.service.create(rawRequest, dto);
    return asResponse(toExternal(newAssetGroup));
  }

  @Override()
  @ApiOperation({ summary: 'Get Asset Groups' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({
    status: 200,
    description: 'Asset groups are provided',
    type: AssetGroupClassDto,
    isArray: true,
  })
  async getMany(
    @ParsedRequest() req: CrudRequest,
  ): Promise<DataResponse<AssetGroupDto[], ApiPaginationMeta>> {
    const ret = await this.base.getManyBase!(req);
    return getDataResponseForCrudMany<AssetGroupEntity, AssetGroupDto>(ret, toExternal);
  }

  @Override()
  @ApiOperation({ summary: 'Get Asset Group by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Asset groups are provided',
    type: AssetGroupClassDto,
  })
  @ApiParam({ name: 'id', type: String })
  async getOne(@ParsedRequest() req: CrudRequest): Promise<DataResponse<AssetGroupDto>> {
    const assetGroup = await this.service.getOne(req);
    return asResponse(toExternal(assetGroup));
  }

  @Override()
  @ApiOperation({ summary: 'Update Asset groups' })
  @ApiBody({ type: AssetGroupClassDto })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Asset group is updated',
    type: AssetGroupClassDto,
  })
  @ApiParam({ name: 'id', type: String })
  async updateOne(
    @Body() dto: Partial<CreateUpdateAssetGroupDtoRequest>,
    @Req() rawRequest: Request,
    @Param('id') id: string,
  ): Promise<DataResponse<AssetGroupDto>> {
    const result = await this.service.update(rawRequest, id, dto);
    return asResponse(toExternal(result));
  }

  @Override()
  @ApiOperation({ summary: 'Delete Asset Group by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Asset groups are delete',
    type: AssetGroupEntity,
  })
  async deleteOne(@ParsedRequest() req: CrudRequest) {
    await this.service.deleteOne(req);
  }
}
