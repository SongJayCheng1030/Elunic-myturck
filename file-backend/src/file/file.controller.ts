import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Controller, Delete, Get, HttpCode, Param, Req } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express-serve-static-core';
import { FileResponse } from 'shared/common/models';
import { asResponse, DataResponse } from 'shared/nestjs';

import { ControllerUtilsService } from './controller-utils.service';
import { FileIdParamDto } from './dto/FileIdParamDto';
import { FileMetaResponseDto } from './dto/FileMetaResponseDto';
import { FileResponseDto } from './dto/FileResponseClassDto';
import { FileService } from './file.service';

@ApiTags('File Controller')
@Controller('/v1')
export class FileController {
  constructor(
    @InjectLogger(FileController.name) private readonly logger: LogService,
    private readonly fileService: FileService,
    private readonly ctrlUtilsService: ControllerUtilsService,
  ) {}

  @Get('copy/:fileId')
  @ApiOperation({ summary: 'Copy file by fileId' })
  @ApiResponse({ status: 404, description: 'Could not get file' })
  @ApiResponse({
    status: 200,
    description: 'File found',
    type: FileResponseDto,
  })
  async copyFile(
    @Param() { fileId }: FileIdParamDto,
    @Req() req: Request,
  ): Promise<DataResponse<FileResponse>> {
    const newFileMeta = await this.fileService.copyFile(fileId);

    return asResponse(await this.ctrlUtilsService.createFileResponseFromMeta(req, newFileMeta));
  }

  @Get('meta/:fileId')
  @ApiOperation({ summary: 'Get meta data by fileId' })
  @ApiResponse({ status: 404, description: 'Could not get file' })
  @ApiResponse({
    status: 200,
    description: 'File found',
    type: FileMetaResponseDto,
  })
  async serveMetadata(
    @Param() { fileId }: FileIdParamDto,
  ): Promise<DataResponse<FileMetaResponseDto>> {
    const fileMeta = await this.fileService.getFileMeta(fileId);

    return asResponse(await this.ctrlUtilsService.createFileMetaResponseFromMeta(fileMeta));
  }

  @Delete('file/:fileId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete file by fileId' })
  @ApiNoContentResponse({
    status: 204,
    description: 'File deleted',
  })
  @ApiResponse({ status: 404, description: 'Could not get file' })
  async deleteFile(@Param() { fileId }: FileIdParamDto): Promise<void> {
    await this.fileService.deleteFile(fileId);
  }
}
