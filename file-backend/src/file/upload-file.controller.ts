import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import * as fileType from 'file-type';
import * as fs from 'fs-extra';
import { isText as isTextSync } from 'istextorbinary';
import * as path from 'path';
import * as readChunk from 'read-chunk';
import { FileResponse } from 'shared/common/models';
import { asResponse, DataResponse } from 'shared/nestjs';
import { ApiFile } from 'shared/nestjs/api-docs';

import { ConfigService } from '../config/config.service';
import { ControllerUtilsService } from './controller-utils.service';
import { FileResponseDto } from './dto/FileResponseClassDto';
import { UploadedFileDto } from './dto/UploadedFileDto';
import { FileService } from './file.service';

@ApiTags('Upload File Controller')
@Controller('/v1')
export class UploadFileController {
  constructor(
    @InjectLogger(UploadFileController.name) private readonly logger: LogService,
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
    private readonly ctrlUtilsService: ControllerUtilsService,
  ) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload File' })
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @ApiResponse({
    status: 201,
    description: 'Created',
    type: FileResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Invalid file',
  })
  async uploadFile(
    @UploadedFile() file: UploadedFileDto,
    @Req() req: Request,
  ): Promise<DataResponse<FileResponse>> {
    this.logger.debug(`uploadFile: ${JSON.stringify(file)}`);

    // Check if file is valid
    try {
      await this.validateFileType(file);
    } catch (ex) {
      throw new BadRequestException('Invalid file: cannot upload!');
    }

    try {
      const newFileMeta = await this.fileService.createFileFromUpload(file);
      return asResponse(await this.ctrlUtilsService.createFileResponseFromMeta(req, newFileMeta));
    } finally {
      // Cleanup: remove temporary file if it has not been moved by the adapter
      if (await fs.pathExists(file.path)) {
        await fs.remove(file.path);
      }
    }
  }

  // ---

  private async validateFileType(uploadFile: UploadedFileDto): Promise<void> {
    // ASCII files might not have a magic number
    const ext = path.extname(uploadFile.originalname).substring(1).toLowerCase();

    this.logger.debug(`validateFileType(): originalname=${uploadFile.originalname}, ext=${ext}`);

    // The library cannot recognize the old microsoft formsts, we than build an
    // exception (and possible security vulnerability for this case)
    if (this.configService.allowedFileTypes.includes('xls') && ext === 'xls') {
      return;
    }
    if (this.configService.allowedFileTypes.includes('ppt') && ext === 'ppt') {
      return;
    }
    if (this.configService.allowedFileTypes.includes('doc') && ext === 'doc') {
      return;
    }

    let isText, ident;
    try {
      [isText, ident] = await this.detectFileType(uploadFile);
    } catch (err) {
      throw new Error('Error while reading or detecting the file');
    }

    this.logger.debug(`validateFileType(): isText=${isText}, ident=${JSON.stringify(ident)}`);

    if (ident) {
      // file type was recognized
      if (!this.configService.allowedFileTypes.includes(ident.ext.toLowerCase())) {
        throw new Error('File type not matching');
      }
    } else if (isText) {
      if (!this.configService.allowedFileTypes.includes(ext)) {
        throw new Error('File type not matching');
      }
    } else {
      throw new Error('File type unknown');
    }
  }

  private async detectFileType(
    file: UploadedFileDto,
  ): Promise<[boolean, fileType.FileTypeResult | null]> {
    // const buffer = await readChunk(file.path, 0, fileType.minimumBytes);
    const buffer = await readChunk(file.path, 0, 0);
    const ident = (await fileType.fromBuffer(buffer)) || null;
    return [isTextSync(undefined, buffer) === true, ident];
  }
}
