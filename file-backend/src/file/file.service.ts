import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ArgumentError, NotFoundError } from 'common-errors';
import * as fs from 'fs-extra';
import * as hasha from 'hasha';
import * as mime from 'mime';
import * as NodeCache from 'node-cache';
import * as path from 'path';
import { FileId } from 'shared/common/models';
import * as sharp from 'sharp';
import { AbstractLocalFileServiceAdapter } from 'src/adapter/AbstractLocalFileServiceAdapter';
import { AbstractRemoteFileServiceAdapter } from 'src/adapter/AbstractRemoteFileServiceAdapter';
import { FileMetadata } from 'src/types';
import { v4 as uuidv4 } from 'uuid';

import { AbstractFileServiceAdapter } from '../adapter/AbstractFileServiceAdapter';
import { ConfigService } from '../config/config.service';
import { GetImageQueryDto } from './dto/GetImageQueryDto';
import { ProvidedFileDto } from './dto/ProvidedFileDto';
import { UploadedFileDto } from './dto/UploadedFileDto';

interface MemoryCacheEntry {
  type: 'meta';
}
interface MemoryCacheMetaEntry extends MemoryCacheEntry {
  type: 'meta';
  metadata: FileMetadata;
}
function memoryCacheMetaKey(fileId: FileId): string {
  return `meta-${fileId}`;
}

@Injectable()
export class FileService implements OnApplicationBootstrap {
  private readonly memoryCache = new NodeCache({
    stdTTL: 10 * 60,
    checkperiod: 60,
  });

  // These are defined here because we need access to the ConfigService instance.
  private readonly BLANK_FILE: ProvidedFileDto = {
    metadata: {
      id: '00000000-0000-0000-0000-000000000000',
      originalName: this.configService.blankImage.filename,
      md5: '',
      mime: 'image/png',
      iat: 0,
      size: 0,
    },
    localPath: this.configService.blankImage.absPath,
  };
  private readonly NO_IMAGE_FILE: ProvidedFileDto = {
    metadata: {
      id: '00000000-0000-0000-0000-000000000000',
      originalName: this.configService.getNoFileImage.filename,
      md5: '',
      mime: 'image/png',
      iat: 0,
      size: 0,
    },
    localPath: this.configService.getNoFileImage.absPath,
  };

  private get localFileCachePath() {
    return this.configService.localCache.folderPath;
  }

  constructor(
    @InjectLogger(FileService.name) private readonly logger: LogService,
    private readonly fileServiceAdapter: AbstractFileServiceAdapter,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await fs.ensureDir(this.localFileCachePath).catch(err => {
      throw new Error(
        `Failed to ensure existence of local file cache folder ${this.localFileCachePath}: ${err.message}`,
      );
    });
    await fs.access(this.localFileCachePath, fs.constants.W_OK).catch(err => {
      throw new Error(
        `Local file cache folder is not writable (${this.localFileCachePath}): ${err.message}`,
      );
    });

    this.logger.info(`Local file cache path: ${this.localFileCachePath}`);
  }

  /**
   * Given a file ID, will ask the storage adapter whether the file exists.
   *
   * @param fileId
   * @returns
   */
  async fileExists(fileId: FileId): Promise<boolean> {
    return this.fileServiceAdapter.fileExists(fileId);
  }

  /**
   * Provide a file locally. The storage adapter will ensure a copy of the file
   * is present locally to allow for the greatest possible flexibility inside
   * the controller.
   *
   * For "local" adapters, we will simply ask them to give us the local file path.
   * For "remote" adapter, we will ask them to download the file to the local cache
   *
   * @param fileId
   * @returns
   */
  async provideLocalFile(fileId: FileId): Promise<ProvidedFileDto> {
    const fileMeta = await this.getFileMeta(fileId);

    let localPath: string;
    if (this.fileServiceAdapter instanceof AbstractRemoteFileServiceAdapter) {
      const cachePath = this.computeLocalCacheFilePath(fileId);
      if (!(await fs.pathExists(cachePath))) {
        await this.fileServiceAdapter.downloadToFile(fileId, cachePath);
      }
      localPath = cachePath;
    } else if (this.fileServiceAdapter instanceof AbstractLocalFileServiceAdapter) {
      localPath = await this.fileServiceAdapter.getLocalFilePath(fileId);
    } else {
      throw new Error('Invalid FileServiceAdapter');
    }

    return {
      metadata: { ...fileMeta },
      localPath,
    };
  }

  /**
   * Given a DTO containing the information about the uploaded file (as set by most upload
   * middlewares), will generate a new random file ID, then direct the storage adapter
   * to store the file.
   *
   * Note that this method does not care what happens to the file inside the adapter or the
   * controller. It is assumed one of them takes care of removing the temporary file.
   *
   * @param file
   * @returns
   */
  async createFileFromUpload(file: UploadedFileDto): Promise<FileMetadata> {
    // Resize the image and convert the format if it is an image
    // 2021-03-10 Commented out - this general functionality makes no sense in the context of Shopfloor
    // TODO Provide options to do this in the future
    // await this.modifyFileIfImage(file);

    const newFileId = await this.generateNewFileId();
    const createdFileMeta = await this.fileServiceAdapter.uploadFile(newFileId, file);

    return createdFileMeta;
  }

  /**
   * Given a file ID, will generate a new random file ID, then direct the storage
   * adapter to create a copy of the file.
   *
   * @param fileId
   * @returns
   */
  async copyFile(fileId: FileId): Promise<FileMetadata> {
    const newFileId = await this.generateNewFileId();
    const newFileMeta = await this.fileServiceAdapter.copyFile(fileId, newFileId);

    return newFileMeta;
  }

  /**
   * Given a file ID, will direct the storage adapter to delete the file.
   */
  async deleteFile(fileId: FileId): Promise<void> {
    await this.fileServiceAdapter.deleteFile(fileId);

    this.delCache(memoryCacheMetaKey(fileId));
  }

  /**
   * Given a file ID, will return the file's metadata. File metadata is stored in
   * a memory cache (with a TTL to prevent cluttering) for fast access.
   *
   * @param fileId
   * @returns
   */
  async getFileMeta(fileId: FileId): Promise<FileMetadata> {
    const cacheKey = memoryCacheMetaKey(fileId);
    const cachedMeta = this.getCache<MemoryCacheMetaEntry>(cacheKey);

    if (cachedMeta) {
      return cachedMeta.metadata;
    }

    const fileMeta = await this.fileServiceAdapter.getFileMeta(fileId);
    this.putCache(cacheKey, {
      type: 'meta',
      metadata: fileMeta,
    });

    return fileMeta;
  }

  /**
   * Given a file ID and a set of options (width, height, ...), will provide a local
   * image file representing the original file.
   * If the original file is an image file, it will return the file itself or a
   * generated thumbnail with the requested dimensions.
   * If the original file is not an image, will return an icon representation of the
   * file type with the requested dimensions.
   *
   * Caches generated images locally for better performances and also to allow for the
   * greatest possible flexibility inside the controller.
   *
   * @param fileId
   * @param options
   * @returns
   */
  async provideLocalImageFile(fileId: FileId, options: GetImageQueryDto): Promise<ProvidedFileDto> {
    const cachePath = this.computeLocalCacheFilePath(
      `${fileId}-${JSON.stringify(options).replace(/[\W]/g, '_')}`,
    );

    let isActualImage: boolean;
    let fileMeta: FileMetadata;
    let originalFile: ProvidedFileDto;
    try {
      fileMeta = await this.getFileMeta(fileId);
      isActualImage = fileMeta.mime.startsWith('image/');

      if (isActualImage) {
        // NOTE: this leads to the actual image file being downloaded in every case,
        // even if we end up getting a cache match further down. Image files will
        // probably never get too big, but this could still be optimized at some point.
        originalFile = await this.provideLocalFile(fileId);
      } else {
        const iconFile = await this.computeNonImageFileIconImage(fileMeta);

        // Construct a "fake" original file containing the icon
        originalFile = {
          metadata: {
            ...iconFile.metadata,
            // Overwrite the icon fileId
            id: fileId,
          },
          localPath: iconFile.localPath,
        };
      }
    } catch (err) {
      if (err instanceof NotFoundError) {
        // This is the "image not found" image
        originalFile = this.NO_IMAGE_FILE;
      } else {
        throw err;
      }
    }

    if (!(await fs.pathExists(cachePath))) {
      try {
        await this.transformImageWithOptions(
          originalFile.localPath,
          cachePath,
          originalFile.metadata.mime,
          originalFile.metadata.iat,
          options,
        );
      } catch (ex) {
        this.logger.error(`Cannot process image with sharp:`, ex);
        this.logger.error(` fileId=${fileId}`);
        this.logger.error(` cachePath=${cachePath}`);
        this.logger.error(` originalFile.localPath=${originalFile.localPath}`);
        originalFile = this.NO_IMAGE_FILE;
      }
    }

    return {
      metadata: { ...originalFile.metadata },
      localPath: cachePath,
    };
  }

  // ---

  // Memory cache methods
  private putCache(fileId: FileId, entry: unknown): void {
    this.memoryCache.set(fileId, entry);
  }
  private delCache(fileId: FileId): void {
    this.memoryCache.del(fileId);
  }
  private getCache<T>(fileId: FileId): T | undefined {
    return this.memoryCache.get<T>(fileId);
  }

  private computeLocalCacheFilePath(cacheKey: string): string {
    return path.join(this.localFileCachePath, cacheKey);
  }

  private async generateNewFileId(): Promise<string> {
    // Generate a unique filename
    let newFileId: FileId;
    do {
      newFileId = uuidv4();
    } while (await this.fileServiceAdapter.fileExists(newFileId));

    return newFileId;
  }

  private async computeNonImageFileIconImage(file: FileMetadata): Promise<ProvidedFileDto> {
    const exten = this.extractFileType(file);

    if (!exten) {
      return this.BLANK_FILE;
    }

    const cacheKey = 'icon-' + exten;
    const cache = this.getCache<ProvidedFileDto>(cacheKey);

    if (cache) {
      return cache;
    }

    const iconName = `${exten}.png`.toLowerCase();
    const iconPath = path.join(this.configService.iconsBaseDir, iconName);
    let providedFile: ProvidedFileDto;
    if (this.configService.thumbnailFileIcons.indexOf(iconName) < 0) {
      providedFile = this.BLANK_FILE;
    } else {
      const stats = await fs.stat(iconPath);
      providedFile = {
        metadata: {
          id: '00000000-0000-0000-0000-000000000000',
          originalName: iconName,
          md5: await hasha.fromFile(iconPath),
          mime: 'image/png',
          iat: stats.mtimeMs,
          size: stats.size,
        },
        localPath: iconPath,
      };
    }

    this.putCache(cacheKey, providedFile);
    return providedFile;
  }

  private extractFileType(file: FileMetadata): string | null {
    // First: inspect the original file name since the browser
    // might send application/octet-stream for any other file
    // than images or other "really" common document formats
    const extension = path.extname(file.originalName).substr(1);
    if (extension.length > 1) {
      return extension;
    }

    // Second: check via mime type library
    const mimeExt = mime.getExtension(file.mime);
    if (mimeExt && mimeExt.length > 0) {
      return mimeExt;
    }

    // Can't identify
    return null;
  }

  private async modifyFileIfImage(file: UploadedFileDto): Promise<void> {
    if (file && file.mimetype && file.mimetype.startsWith('image')) {
      const maxImageSize = this.configService.maxImageSize;
      const fileBuf = await fs.readFile(file.path);
      let outBuf: Buffer;

      if (file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        outBuf = await sharp(fileBuf)
          // limit image size
          .resize(maxImageSize, maxImageSize, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .png()
          .toBuffer();
      } else {
        outBuf = await sharp(fileBuf)
          // limit image size
          .resize(maxImageSize, maxImageSize, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({
            quality: 75,
          })
          .toBuffer();
      }

      if (!outBuf) {
        throw new ArgumentError(`Cannot process image, e.g. damaged image or unkown format!`);
      }

      file.size = outBuf.length;
      await fs.writeFile(file.path, outBuf);
    }
  }

  private async transformImageWithOptions(
    inputPath: string,
    outputPath: string,
    mimeType: string,
    filemtime: number,
    options: GetImageQueryDto,
  ): Promise<void> {
    const width = options.w
      ? Math.max(0, Math.min(this.configService.maxImageSize, options.w))
      : null;
    const height = options.h
      ? Math.max(0, Math.min(this.configService.maxImageSize, options.h))
      : null;

    let bgFill: sharp.Color | undefined;
    if (options.bg) {
      const matchRgbColor = options.bg.match(/^#?([0-9a-f]{6})$/);
      if (matchRgbColor) {
        const color = Number.parseInt(matchRgbColor[1], 16);
        bgFill = {
          r: ((color & 0xff0000) >> 16) & 0xff,
          g: ((color & 0x00ff00) >> 8) & 0xff,
          b: color & 0x0000ff & 0xff,
          alpha: 1,
        };
      }
    }

    let image = sharp(inputPath).rotate();

    if (bgFill || width !== null || height !== null) {
      image = image.resize(width, height, {
        fit: options.fit,
        background: bgFill,
      });
    }
    // Should infer the format from the extension
    // TODO what if no extension is present, or if the format is unsupported? Perhaps use JPEG by default or allow passing a format option?
    await image.toFile(outputPath);

    // Set mtime correctly to ensure a correct "not-modified-since" header
    await fs.utimes(outputPath, filemtime, filemtime);
  }
}
