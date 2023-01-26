import { Controller, Get, Req } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { getResponseForMany, TenantIdAutoFilter } from 'shared/nestjs';

import { StepTagEntity } from './entities/step-tag.entity';
import { StepTagService } from './step-tag.service';

@ApiTags('Maintenance tags controller')
@TenantIdAutoFilter()
@Controller('step-tags')
export class StepTagController {
  constructor(private stepTagService: StepTagService) {}

  @Get()
  @ApiOkResponse({ type: getResponseForMany(StepTagEntity) })
  async getAllTags(@Req() req: Request): Promise<StepTagEntity[]> {
    return this.stepTagService.all(req.auth);
  }
}
