import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { CrudxPaginationMeta } from 'shared/common/models';
import { asResponse, DataResponse } from 'shared/nestjs';

import { ActivityLogService } from './activity-log.service';
import { ActivityLogClassDto, ActivityLogDto, toExternal } from './dto/ActivityLogDto';
import {
  ActivityLogQueryFilterClassDto,
  ActivityLogQueryFilterSchema,
} from './dto/ActivityLogQueryFilterDto';

@Controller('activity-logs')
@ApiTags('Activity Logs Controller')
export class ActivityLogController {
  constructor(private readonly activityService: ActivityLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get Activity Logs' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({
    status: 200,
    description: 'Assets are provided',
    type: ActivityLogClassDto,
    isArray: true,
  })
  @ApiQuery({ name: 'queryData' })
  async getActivityLogs(
    @Query(new JoiPipe(ActivityLogQueryFilterSchema)) queryData: ActivityLogQueryFilterClassDto,
    @Req() rawRequest: Request,
  ): Promise<DataResponse<ActivityLogDto[], CrudxPaginationMeta>> {
    const page = Math.max(1, queryData.page); // Ensure to start from page 1

    const results = await this.activityService.findLogsByFilter(
      rawRequest.auth,
      queryData,
      (page - 1) * queryData.limit,
      queryData.limit,
    );

    return asResponse(
      results.first.map(r => toExternal(r)),
      {
        page,
        pageCount: Math.ceil(results.second / queryData.limit),
        total: results.second,
        count: results.first.length,
      },
    );
  }
}
