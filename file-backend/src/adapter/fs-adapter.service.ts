import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { OnApplicationBootstrap } from '@nestjs/common';
import { NotFoundError } from 'common-errors';
import * as fs from 'fs-extra';
import * as hasha from 'hasha';
import * as path from 'path';
import { FileId } from 'shared/common/models';
import { UploadedFileDto } from 'src/file/dto/UploadedFileDto';
import { FileMetadata } from 'src/types';

import { ConfigService } from '../config/config.service';
import { AbstractLocalFileServiceAdapter } from './AbstractLocalFileServiceAdapter';

export class FsAdapterService
  extends AbstractLocalFileServiceAdapter
  implements OnApplicationBootstrap {
  MUST_BE_CACHED_LOCALLY = false;

  private readonly storagePath = this.configService.localFs.storagePath;

  constructor(
    private readonly configService: ConfigService,
    @InjectLogger(FsAdapterService.name) private readonly logger: LogService,
  ) {
    super();
  }

  async onApplicationBootstrap(): Promise<void> {
    if (!(await this.isValidStorageLocation())) {
      this.logger.error(`File storage location not existing: ${this.storagePath}`);
      this.logger.error(`Did you set the ENVs accordingly correctly?`);
      this.logger.error(`Cannot start!`);
      throw new Error(`Cannot start fs adapter because invalid storage dir.`);
    }

    this.logger.info(`Storing files into: ${this.storagePath}`);
  }

  async getLocalFilePath(fileId: FileId): Promise<string> {
    this.logger.debug(`provideFile(${fileId})`);

    if (!(await this.fileExists(fileId))) {
      throw new NotFoundError(`File not found: ${fileId}`);
    }

    const filePath = this.computeFilePathFromId(fileId);
    this.logger.debug(`Actual file located at: ${filePath}`);

    return filePath;
  }

  async fileExists(fileId: FileId): Promise<boolean> {
    const filePath = this.computeFilePathFromId(fileId);

    return await fs.pathExists(filePath);
  }

  async getFileMeta(fileId: FileId): Promise<FileMetadata> {
    if (!(await this.fileExists(fileId))) {
      throw new NotFoundError(`File not found: ${fileId}`);
    }

    const metaFile = await this.getMeta(fileId);

    return {
      ...metaFile,
    };
  }

  async uploadFile(newFileId: FileId, newFile: UploadedFileDto): Promise<FileMetadata> {
    this.logger.debug(`Add new file: ${newFileId}, ${JSON.stringify(newFile)}`);

    const metaPath = this.computeMetaPathFromId(newFileId);
    const filePath = this.computeFilePathFromId(newFileId);

    // Upload the file metadata
    // ---
    const infoBlock: FileMetadata = {
      id: newFileId,
      originalName: newFile.originalname,
      mime: newFile.mimetype,
      size: newFile.size,
      iat: Date.now(),
      md5: await hasha.fromFile(newFile.path, { algorithm: 'md5' }),
    };

    this.logger.debug(`Target: ${filePath}, ${metaPath}`);

    try {
      await fs.writeFile(metaPath, JSON.stringify(infoBlock, null, 4));
      await this.moveSafe(newFile.path, filePath);
      await fs.utimes(filePath, Date.now(), Date.now());

      return {
        ...infoBlock,
      };
    } catch (err) {
      if (await fs.pathExists(metaPath)) {
        await fs.remove(metaPath);
      }
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }

      throw err;
    }
  }

  async copyFile(fileId: FileId, newFileId: FileId): Promise<FileMetadata> {
    if (!(await this.fileExists(fileId))) {
      throw new NotFoundError(`File not found: ${fileId}`);
    }

    const oldMeta = await this.getMeta(fileId);
    const oldFilePath = this.computeFilePathFromId(fileId);

    const newMetaPath = this.computeMetaPathFromId(newFileId);
    const newFilePath = this.computeFilePathFromId(newFileId);

    const newMeta: FileMetadata = {
      id: newFileId,
      originalName: oldMeta.originalName,
      mime: oldMeta.mime,
      size: oldMeta.size,
      iat: Date.now(),
      md5: oldMeta.md5,
    };

    this.logger.debug(`Target: ${newFilePath}, ${newMetaPath}`);

    try {
      await fs.writeFile(newMetaPath, JSON.stringify(newMeta, null, 4));
      await this.copySafe(oldFilePath, newFilePath);
      await fs.utimes(newFilePath, Date.now(), Date.now());

      return {
        ...newMeta,
      };
    } catch (err) {
      if (await fs.pathExists(newMetaPath)) {
        await fs.remove(newMetaPath);
      }
      if (await fs.pathExists(newFilePath)) {
        await fs.remove(newFilePath);
      }

      throw err;
    }
  }

  async deleteFile(fileId: FileId): Promise<void> {
    this.logger.debug(`deleteFile(${fileId})`);

    if (!(await this.fileExists(fileId))) {
      throw new NotFoundError(`File not found: ${fileId}`);
    }

    const metaPath = this.computeMetaPathFromId(fileId);
    const metaPathExists = await fs.pathExists(metaPath);
    this.logger.debug(`Deleting meta file from: ${metaPath}, ${metaPathExists}`);

    const filePath = this.computeFilePathFromId(fileId);
    const filePathExists = await fs.pathExists(filePath);
    this.logger.debug(`Deleting file from: ${filePath}, ${filePathExists}`);

    if (metaPathExists) {
      await fs.promises.unlink(metaPath);
    }

    if (filePathExists) {
      await fs.promises.unlink(filePath);
    }
  }

  // ---

  private computeFilePathFromId(fileId: FileId): string {
    return path.join(this.storagePath, fileId);
  }
  private computeMetaPathFromId(fileId: FileId): string {
    return path.join(this.storagePath, `${fileId}.json`);
  }

  /**
   * Checks if the path provided on env `ABS_FILE_DIR` (fileStorageDir) is existing
   * and tries to create it if not yet existing. Returns a boolean indicating the
   * result.
   */
  private async isValidStorageLocation(): Promise<boolean> {
    if (!this.storagePath || typeof this.storagePath !== 'string') {
      return false;
    }

    if (!path.isAbsolute(this.storagePath)) {
      this.logger.error(`Not an absolute path given!`);
      return false;
    }

    // Check if exists and create if not
    await fs.ensureDir(this.storagePath);
    if (!(await fs.pathExists(this.storagePath))) {
      this.logger.error(`Giving up: cannot create directory: ${this.storagePath}`);
      return false;
    }

    // Check if directory
    try {
      const dir = await fs.stat(this.storagePath);
      if (dir.isDirectory()) {
        // Fine
        return true;
      }
    } catch (ex) {
      this.logger.error(`Not a directory:`, ex);
    }

    return false; // Not a directory
  }

  private async getMeta(fileId: FileId): Promise<FileMetadata> {
    const metaPath = this.computeMetaPathFromId(fileId);
    this.logger.debug(`File ${fileId} META-INF file located at: ${metaPath}`);

    // Check if file exists
    if (!(await fs.pathExists(metaPath))) {
      throw new NotFoundError(`No such file: ${fileId}`);
    }

    // Load the metadata file
    // ---
    let fileInfo: FileMetadata | null = null;
    try {
      fileInfo = await fs.readJSON(metaPath);
    } catch (ex) {
      throw new Error(`Error while reading meta file`);
    }

    if (!fileInfo || !fileInfo.id) {
      throw new Error('Corrupt meta file.');
    }

    return fileInfo;
  }

  /**
   * In certain situations it might be that you get the following error:
   *
   *   Error: EPERM: operation not permitted, copyfile ....
   *
   * this is relatively normal, if you mount a non Linux-fs as data dir,
   * because move then complains that the permissions cannot be set. The
   * actual operation succeeds but this error messages are put out although
   * they are more like warnings. For this reason this wrapper function
   * will check for it
   *
   * @param source The source file
   * @param destination The target file
   */
  private async moveSafe(source: string, destination: string): Promise<void> {
    try {
      await fs.move(source, destination);
    } catch (ex) {
      await this.handleCopyOrMoveException(ex, source, destination);
    }
  }

  /**
   * Same as `moveSafe` just for file copy. See that docu
   */
  private async copySafe(source: string, destination: string): Promise<void> {
    try {
      await fs.copy(source, destination);
    } catch (ex) {
      await this.handleCopyOrMoveException(ex, source, destination);
    }
  }

  /**
   * Companion function for `moveSafe` and `copySafe` to handle special
   * exceptions which are not acutal errors (see docu of `moveSafe`)
   */
  private async handleCopyOrMoveException(
    ex: unknown,
    source: string,
    destination: string,
  ): Promise<void> {
    const msg = `${ex}`;

    if (msg.indexOf('EPERM') > -1) {
      // Permissions issue, ensure that the files exist
      try {
        // Ensure no exception in exception handler;
        // if the destination file exists, everything
        // is fine and the operation worked
        if (await fs.pathExists(destination)) {
          return;
        }
      } catch (_) {
        // Silence is gold
      }
    }

    this.logger.error(`Failed to move '${source}' --> '${destination}'`);
    this.logger.error(`Message: ${msg}`);

    // Forward the original exception
    throw ex;
  }
}
