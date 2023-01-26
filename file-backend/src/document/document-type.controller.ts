import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { asResponse } from 'shared/backend';
import { DataResponse, ResponseSerializerInterceptor } from 'shared/nestjs';

import { ActivityLogEntity } from './activity-log.entity';
import { DocumentTypeService } from './document-type.service';
import { PostDocumentTypeDto } from './dto/document-type';

@ApiTags('Document Type Controller')
@ApiBearerAuth()
@Controller('/v1/document-types')
@UseInterceptors(ResponseSerializerInterceptor)
export class DocumentTypeController {
  constructor(
    @InjectLogger(DocumentTypeController.name) private readonly logger: LogService,
    private readonly service: DocumentTypeService,
  ) {}

  @Get('/:id')
  async getOne(@Req() req: Request, @Param('id') id: string) {
    const type = await this.service.getOneById(req.auth, id);
    return asResponse(type);
  }

  @Get('/')
  async getMany(@Req() req: Request, @Query('name') name?: string) {
    return asResponse(await this.service.getAllowed(req.auth, name));
  }

  @Post('/')
  async create(@Req() req: Request, @Body() dto: PostDocumentTypeDto) {
    return asResponse(await this.service.create(req.auth, dto));
  }

  @Put('/:id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: PostDocumentTypeDto) {
    await this.service.getOneById(req.auth, id);
    return asResponse(await this.service.update(req.auth, id, dto));
  }

  @Delete('/:id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    await this.service.getOneById(req.auth, id);
    return asResponse(await this.service.delete(req.auth, id));
  }

  @Get(':id/activities')
  async getHistory(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<DataResponse<ActivityLogEntity[], Record<string, unknown>>> {
    await this.service.getOneById(req.auth, id);
    return asResponse(await this.service.getActivities(req.auth, id));
  }
}
