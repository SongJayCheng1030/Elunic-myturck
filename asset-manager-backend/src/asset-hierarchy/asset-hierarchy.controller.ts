import { Body, Controller, Get, NotFoundException, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import * as Joi from 'joi';
import { JoiPipe } from 'nestjs-joi';
import { CrudxPaginationMeta } from 'shared/common/models';
import { asResponse, DataResponse, ParseBooleanPipe } from 'shared/nestjs';

import { ActivityLogEntity, ActivityLogObjectType } from '../activity-log/activity-log.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';
import {
  ActivityLogAssetHierarchyRevisionDto,
  ActivityLogAssetHierarchyRevisionlassDto,
  toExternal,
} from '../activity-log/dto/ActivityLogDto';
import { ActivityLogQueryFilterDto } from '../activity-log/dto/ActivityLogQueryFilterDto';
import { ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS, ENDPOINT_RESULT_QUERY_LIMIT } from '../definitions';
import { AssetHierarchyService } from './asset-hierarchy.service';
import { AssetTreeNodeClassDto, AssetTreeNodeDto } from './dto/AssetTreeNodeDto';
import {
  TreeTransformActionClassDto,
  TreeTransformActionSchema,
} from './dto/TreeTransformActionDto';

@Controller('tree')
@ApiTags('Asset Hierarchy Controller')
export class AssetHierarchyController {
  constructor(
    private readonly hierarchyService: AssetHierarchyService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get Asset Hierarchy' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({
    status: 200,
    description: 'The Asset Hierarchy is provided',
    type: AssetTreeNodeClassDto,
    isArray: true,
  })
  @ApiQuery({ name: 'cached', type: Boolean, required: false })
  async getAssetTree(
    @Query('cached', new ParseBooleanPipe({ required: false })) cached: boolean,
    @Req() req: Request,
  ): Promise<DataResponse<AssetTreeNodeDto[]>> {
    return asResponse(await this.hierarchyService.getAssetTree(req.auth, !!cached));
  }

  @Get('/revisions')
  @ApiOperation({ summary: 'Get Asset Hierarchy revisions' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({
    status: 200,
    description: 'The Asset Hierarchy revisions is provided',
    type: ActivityLogAssetHierarchyRevisionlassDto,
    isArray: true,
  })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'page', type: Number, required: true })
  async getAllRevisions(
    @Query(
      'limit',
      new JoiPipe(
        Joi.number()
          .min(1)
          .max(ENDPOINT_RESULT_QUERY_LIMIT)
          .default(ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS),
      ),
    )
    limit: number,
    @Query('page', new JoiPipe(Joi.number().min(0).default(1))) page: number,
    @Req() req: Request,
  ): Promise<DataResponse<ActivityLogAssetHierarchyRevisionDto[], CrudxPaginationMeta>> {
    const filter = {
      limit,
      page: Math.max(1, page), // Ensure to start from page 1
      objectType: ActivityLogEntity.toActivityLogObjectTypeString(
        ActivityLogObjectType.ASSET_HIERARCHY,
      ),
      refId: null,
    } as ActivityLogQueryFilterDto;

    const result = await this.activityLogService.findLogsByFilter(
      req.auth,
      filter,
      (page - 1) * limit,
      limit,
    );

    return asResponse(
      result.first.map(r => toExternal(r, false)),
      {
        page,
        pageCount: Math.ceil(result.second / filter.limit),
        total: result.second,
        count: result.first.length,
      },
    );
  }

  @Get('/revisions/:revisionId')
  @ApiOperation({ summary: 'Get Asset Hierarchy revision by revisionId' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'The Asset Hierarchy revision is provided',
    type: ActivityLogAssetHierarchyRevisionlassDto,
  })
  @ApiParam({ name: 'revisionId', type: String })
  async getAssetTreeRevision(
    @Param('revisionId') revisionId: string,
    @Req() req: Request,
  ): Promise<DataResponse<ActivityLogAssetHierarchyRevisionDto>> {
    const result = await this.activityLogService.findLogsByFilter(
      req.auth,
      {
        id: revisionId,
        objectType: ActivityLogEntity.toActivityLogObjectTypeString(
          ActivityLogObjectType.ASSET_HIERARCHY,
        ),
      } as ActivityLogQueryFilterDto,
      0,
      1,
    );

    if (result.first.length < 1) {
      throw new NotFoundException(`No such revision`);
    }

    return asResponse(toExternal(result.first[0]));
  }

  @Post('/transform')
  @ApiOperation({ summary: 'Transform Asset Hierarchy' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({
    status: 201,
    description: 'Asset Hierarchy is transformed',
  })
  async transformAssetHierarchy(
    @Body(new JoiPipe(TreeTransformActionSchema)) dto: TreeTransformActionClassDto,
    @Req() req: Request,
  ): Promise<void> {
    await this.hierarchyService.applyHierarchyTransformation(req.auth, dto);
  }
}
