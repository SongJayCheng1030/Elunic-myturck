/* eslint @typescript-eslint/no-use-before-define: 0 */
/* eslint @typescript-eslint/explicit-module-boundary-types: 0 */

import { Body, Controller, NotFoundException, Param, Put, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@rewiko/crud';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { AssetImageMapDto } from 'shared/common/models';
import {
  ApiPaginationMeta,
  asResponse,
  DataResponse,
  getDataResponseForCrudMany,
} from 'shared/nestjs';

import {
  ENDPOINT_QUERY_CACHE_TIME,
  ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS,
  ENDPOINT_RESULT_QUERY_LIMIT,
} from '../definitions';
import { AssetImageMapEntity } from './asset-image-map.entity';
import { AssetImageMapService } from './asset-image-map.service';
import { AssetImageMapClassDto } from './dto/AssetImageMapDto';
import { CreateImageMapClassDto, CreateImageMapSchema } from './dto/CreateAssetImageMapDto';
import {
  SetParentAssetImageMapClassDto,
  SetParentMapSchema,
  UpdateImageMapClassDto,
  UpdateImageMapSchema,
} from './dto/UpdateAssetImageMapDto';

@Crud({
  model: {
    type: AssetImageMapEntity,
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
      mapItems: {
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
@Controller('asset-image-map')
@ApiTags('Asset image map Controller')
export class AssetImageMapController implements CrudController<AssetImageMapEntity> {
  constructor(public service: AssetImageMapService) {}

  get base(): CrudController<AssetImageMapEntity> {
    return this;
  }

  @Override()
  @ApiOperation({ summary: 'Create image map' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({
    status: 201,
    description: 'The Image map is created',
    type: AssetImageMapClassDto,
  })
  async createOne(
    @Body(new JoiPipe(CreateImageMapSchema)) dto: CreateImageMapClassDto,
    @Req() rawRequest: Request,
  ): Promise<DataResponse<AssetImageMapDto>> {
    const ret = await this.service.createAssetImageMap(rawRequest.auth, dto);
    return asResponse(AssetImageMapEntity.toExternal(ret));
  }

  @Override()
  @ApiOperation({ summary: 'Get list of maps' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({
    status: 200,
    description: 'The List is provided',
    type: AssetImageMapClassDto,
    isArray: true,
  })
  async getMany(
    @ParsedRequest() req: CrudRequest,
  ): Promise<DataResponse<AssetImageMapDto[], ApiPaginationMeta>> {
    const ret = await this.base.getManyBase!(req);
    return getDataResponseForCrudMany<AssetImageMapEntity, AssetImageMapDto>(
      ret,
      AssetImageMapEntity.toExternal,
    );
  }

  @Put('select-parent')
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({
    status: 200,
    description: 'The asset is updated',
    type: AssetImageMapClassDto,
  })
  async setImageMapToAsset(
    @Body(new JoiPipe(SetParentMapSchema)) dto: SetParentAssetImageMapClassDto,
  ): Promise<void> {
    await this.service.setImageMapToAsset(dto.assetId, dto.imageMapId);
  }

  @Override()
  @ApiOperation({ summary: 'Get Image map by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The Image map is provided',
    type: AssetImageMapClassDto,
  })
  @ApiParam({ name: 'id', type: String })
  async getOne(@ParsedRequest() req: CrudRequest): Promise<DataResponse<AssetImageMapDto>> {
    const result = await this.base.getOneBase!(req);
    return asResponse(AssetImageMapEntity.toExternal(result));
  }

  @Override()
  @ApiOperation({ summary: 'Update image map by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({
    status: 200,
    description: 'The image map is updated',
    type: AssetImageMapClassDto,
  })
  @ApiParam({ name: 'id', type: String })
  async updateOne(
    @Body(new JoiPipe(UpdateImageMapSchema)) dto: UpdateImageMapClassDto,
    @Param('id') id: string,
    @ParsedRequest() req: CrudRequest,
  ): Promise<DataResponse<AssetImageMapDto>> {
    if (!id || !dto.id) {
      throw new NotFoundException(`No such image map`);
    }
    const result = await this.base.updateOneBase!(req, dto);
    return asResponse(AssetImageMapEntity.toExternal(result));
  }

  @Override()
  @ApiOperation({ summary: 'Delete image map by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The image map is delete',
    type: Boolean,
  })
  @ApiParam({ name: 'id', type: String })
  async deleteOne(@Param('id') id: string): Promise<void> {
    // Perform the actual action of soft-deleting the image map
    await this.service.softDeleteById(id);
  }
}
