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
import { JoiPipe } from 'nestjs-joi';
import { CreateDocumentLinkDto } from 'shared/common/models';
import {
  asResponse,
  DataResponse,
  ParseBooleanPipe,
  ResponseSerializerInterceptor,
} from 'shared/nestjs';

import { ActivityLogEntity } from './activity-log.entity';
import { DocumentEntity } from './document.entity';
import { DocumentService } from './document.service';
import { DocumentLinkEntity } from './document-link.entity';
import {
  GetDocumentsQueryParams,
  GetDocumentsQueryParamsSchema,
  PostDocumentDto,
  PutDocumentDto,
} from './dto/document';

@ApiTags('Document Controller')
@ApiBearerAuth()
@Controller('/v1/documents')
@UseInterceptors(ResponseSerializerInterceptor)
export class DocumentController {
  constructor(
    @InjectLogger(DocumentController.name) private readonly logger: LogService,
    public service: DocumentService,
  ) {}

  @Get(':id')
  async getOne(
    @Req() req: Request,
    @Param('id') id: string,
    @Query('withLinks', new ParseBooleanPipe({ required: false })) withLinks = false,
  ): Promise<DataResponse<DocumentEntity, Record<string, unknown>>> {
    return asResponse(await this.service.getOneById(req.auth, id, withLinks));
  }

  @Get()
  async getMany(
    @Req() req: Request,
    @Query(new JoiPipe(GetDocumentsQueryParamsSchema))
    query: GetDocumentsQueryParams,
  ): Promise<DataResponse<DocumentEntity[], Record<string, unknown>>> {
    if (query.refIds && typeof query.refIds === 'string') {
      query.refIds = [query.refIds];
    }
    return asResponse(await this.service.getAll(req.auth, query));
  }

  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: PostDocumentDto,
  ): Promise<DataResponse<DocumentEntity>> {
    return asResponse(await this.service.create(req.auth, dto));
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: PutDocumentDto,
  ): Promise<DataResponse<DocumentEntity>> {
    return asResponse(await this.service.update(req.auth, id, dto));
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string): Promise<DataResponse<boolean>> {
    return asResponse(await this.service.delete(req.auth, id));
  }

  @Get(':id/links')
  async getLinks(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<DataResponse<DocumentLinkEntity[], Record<string, unknown>>> {
    return asResponse(await this.service.getLinks(req.auth, id));
  }

  @Post(':id/assign')
  async addLink(@Req() req: Request, @Param('id') id: string, @Body() dto: CreateDocumentLinkDto) {
    await this.service.assign(req.auth, id, dto);
    return asResponse(true);
  }

  @Delete(':id/unassign/:refId')
  async removeLink(@Req() req: Request, @Param('id') id: string, @Param('refId') refId: string) {
    await this.service.unassign(req.auth, id, refId);
    return asResponse(true);
  }

  @Get(':id/activities')
  async getHistory(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<DataResponse<ActivityLogEntity[], Record<string, unknown>>> {
    return asResponse(await this.service.getActivities(req.auth, id));
  }
}
