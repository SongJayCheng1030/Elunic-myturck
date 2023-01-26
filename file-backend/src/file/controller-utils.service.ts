import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { FileMetaResponse, FileResponse } from 'shared/common/models';
import { FileMetadata } from 'src/types';

import { ConfigService } from '../config/config.service';

@Injectable()
export class ControllerUtilsService {
  private _baseUrlCached: string | null = null;

  constructor(private readonly configService: ConfigService) {}

  async getBackendBaseServiceUrl(req: Request): Promise<string> {
    if (this._baseUrlCached) {
      return this._baseUrlCached;
    }

    // TODO
    if (process.env.NODE_ENV === 'development') {
      return `http://localhost:${this.configService.httpPort}`;
    }

    // Check if header
    if (req && (req.headers['host'] || req.headers['x-host'])) {
      this._baseUrlCached = `https://${req.headers['host'] || req.headers['x-host']}`;
      return this._baseUrlCached;
    }

    // Unkown
    return '';
  }

  async createFileMetaResponseFromMeta(meta: FileMetadata): Promise<FileMetaResponse> {
    // Extract mime
    let parsedMime = meta.mime.split('/');
    parsedMime =
      parsedMime && parsedMime.length === 2
        ? parsedMime.map((n: string) => n.toLowerCase())
        : ['binary', 'octet-stream'];

    return {
      id: meta.id,
      mimeType: parsedMime,
      mimeTypeRaw: meta.mime,
      name: meta.originalName,
      isImage: parsedMime[0] === 'image',
      md5: meta.md5,
    };
  }

  async createFileResponseFromMeta(req: Request, meta: FileMetadata): Promise<FileResponse> {
    const metaResponse = await this.createFileMetaResponseFromMeta(meta);

    const url = await this.getBackendBaseServiceUrl(req);
    return {
      ...metaResponse,
      url,
    };
  }
}
