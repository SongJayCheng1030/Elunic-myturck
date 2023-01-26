import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Response } from 'express-serve-static-core';
import * as fs from 'fs-extra';

import { ConfigService } from '../config/config.service';
import { FileIdParamDto } from './dto/FileIdParamDto';
import { GetImageQueryDto } from './dto/GetImageQueryDto';
import { FileService } from './file.service';

@ApiTags('Fetch File Controller')
@ApiBearerAuth()
@Controller('/v1')
export class FetchFileController {
  constructor(
    @InjectLogger(FetchFileController.name) private readonly logger: LogService,
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  @Get('image/:fileId')
  @ApiOperation({ summary: 'Get Image by fileId' })
  @ApiResponse({
    status: 200,
    description: 'File found',
    content: {
      'image/*': {
        example: 'binary',
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Could not get image' })
  async serveImage(
    @Param() { fileId }: FileIdParamDto,
    @Query() imageOptions: GetImageQueryDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const providedFile = await this.fileService.provideLocalImageFile(fileId, imageOptions);

    if (!(await fs.pathExists(providedFile.localPath))) {
      providedFile.localPath = this.configService.getNoFileImage.absPath;
    }

    res.sendFile(providedFile.localPath, {
      lastModified: true,
      dotfiles: 'deny',
      headers: {
        'Cache-Control': `public, max-age=${this.configService.browserCacheDurationSecs}`,
        'Content-Disposition': `inline`,
        'Content-Type': providedFile.metadata.mime,
      },
      acceptRanges: true,
      cacheControl: true,
    });
  }

  @Get('file/:fileId')
  @ApiOperation({ summary: 'Get File by fileId' })
  @ApiResponse({
    status: 200,
    description: 'File download link',
    content: {
      '*': {
        example: 'binary',
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Could not get File' })
  @ApiQuery({
    required: false,
    name: 'disposition',
  })
  async serveFile(
    @Param() { fileId }: FileIdParamDto,
    @Query('disposition') disposition: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const providedFile = await this.fileService.provideLocalFile(fileId);

    res.sendFile(providedFile.localPath, {
      lastModified: true,
      dotfiles: 'deny',
      headers: {
        'Cache-Control': `public, max-age=${this.configService.browserCacheDurationSecs}`,
        ...(disposition === 'inline'
          ? { 'Content-Disposition': `inline` }
          : {
              'Content-Disposition': `attachment; filename="${this.sanitizeContentDisposition(
                providedFile.metadata.originalName,
              )}"`,
            }),
        'Content-Type': providedFile.metadata.mime,
      },
      acceptRanges: true,
      cacheControl: true,
    });
  }

  // ---

  private sanitizeContentDisposition(instr: string): string {
    return `${instr || ''}`
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/Ä/g, 'Ae')
      .replace(/Ö/g, 'Oe')
      .replace(/Ü/g, 'Ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-zA-Z0-9_\- .]/g, '')
      .replace(/\s{2,}/, ' ');
  }
}
