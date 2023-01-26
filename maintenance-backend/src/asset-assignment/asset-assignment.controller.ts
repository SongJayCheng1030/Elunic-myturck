import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { getResponseForMany } from 'shared/nestjs';

import { AssetAssignmentService } from './asset-assignment.service';
import { FindAssignmentQuery, FindAssignmentQuerySchema } from './dto/asset-assignment.dto';
import { AssetAssignmentEntity } from './entities/asset-assignment.entity';

@ApiTags('Maintenance assignment controller')
@Controller('assignments')
export class AssetAssignmentController {
  constructor(private readonly service: AssetAssignmentService) {}

  @Get('')
  @ApiOkResponse({ type: getResponseForMany(AssetAssignmentEntity) })
  findAssignments(
    @Req() req: Request,
    @Query(
      new JoiPipe(FindAssignmentQuerySchema, { defaultValidationOptions: { allowUnknown: false } }),
    )
    query: FindAssignmentQuery,
  ): Promise<AssetAssignmentEntity[]> {
    return this.service.getMany(req.auth, { assetId: query.assetId });
  }
}
