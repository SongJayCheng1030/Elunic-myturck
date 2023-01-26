import {
  BlobDownloadResponseParsed,
  BlobServiceClient,
  BlobUploadCommonResponse,
  BlockBlobUploadResponse,
  ContainerClient,
  RestError,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { LogService } from '@elunic/logger';
import { NotFoundError } from 'common-errors';
import * as fs from 'fs-extra';
import * as hasha from 'hasha';
import { FileId } from 'shared/common/models';
import { UploadedFileDto } from 'src/file/dto/UploadedFileDto';
import { FileMetadata } from 'src/types';
import { Readable } from 'stream';

import { ConfigService } from '../config/config.service';
import { AbstractRemoteFileServiceAdapter } from './AbstractRemoteFileServiceAdapter';

export class AzureStorageError extends Error {}

export class AzureAdapterService extends AbstractRemoteFileServiceAdapter {
  private azClient: BlobServiceClient | null = null;
  private containerClient: ContainerClient | null = null;

  constructor(private readonly configService: ConfigService, private readonly logger: LogService) {
    super();
  }

  async fileExists(fileId: FileId): Promise<boolean> {
    try {
      const client = await this.getContainerClient();
      const blobClient = client.getBlobClient(this.metaFilenameFromId(fileId));

      return await blobClient.exists();
    } catch (ex) {
      throw this.handleAzureException(ex);
    }
  }

  async downloadToFile(fileId: FileId, targetPath: string): Promise<void> {
    this.logger.debug(`downloadFile(${fileId})`);

    if (!(await this.fileExists(fileId))) {
      throw new NotFoundError(`File not found: ${fileId}`);
    }

    const client = await this.getContainerClient();

    // Download the metadata file
    const fileInfo: FileMetadata = await this.getMeta(fileId);

    this.logger.debug(`Found file metadata: ${JSON.stringify(fileInfo)}`);

    // Download the actual file
    // ---
    try {
      if (await fs.pathExists(targetPath)) {
        await fs.remove(targetPath);
      }

      const blobClient = client.getBlobClient(this.filenameFromId(fileId));
      await blobClient.downloadToFile(targetPath);
      await fs.utimes(targetPath, fileInfo.iat, fileInfo.iat);
    } catch (ex) {
      throw this.handleAzureException(ex);
    }
  }

  async uploadFile(newFileId: FileId, newFile: UploadedFileDto): Promise<FileMetadata> {
    this.logger.debug(`Add new file: ${JSON.stringify(newFile)}`);

    const client = await this.getContainerClient();

    this.logger.debug(`Uploading ${newFile.path} with size ${newFile.size} bytes`);

    // Upload the file
    // ---
    try {
      const blobClient = client.getBlockBlobClient(this.filenameFromId(newFileId));
      const response = await blobClient.upload(
        () => fs.createReadStream(newFile.path),
        newFile.size,
      );
      this.handleUploadResponseError(response);
    } catch (ex) {
      throw this.handleAzureException(ex);
    }

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

    try {
      const metaString = JSON.stringify(infoBlock, null, 4);

      const blobClient = client.getBlockBlobClient(this.metaFilenameFromId(infoBlock.id));
      const response = await blobClient.upload(metaString, metaString.length);

      this.handleUploadResponseError(response);
    } catch (ex) {
      this.handleAzureException(ex);
    }

    return {
      ...infoBlock,
    };
  }

  async getFileMeta(fileId: FileId): Promise<FileMetadata> {
    if (!(await this.fileExists(fileId))) {
      throw new NotFoundError(`File not found: ${fileId}`);
    }

    try {
      const metaFile = await this.getMeta(fileId);

      return {
        ...metaFile,
      };
    } catch (ex) {
      throw this.handleAzureException(ex);
    }
  }

  async copyFile(fileId: FileId, newFileId: FileId): Promise<FileMetadata> {
    if (!(await this.fileExists(fileId))) {
      throw new NotFoundError(`File not found: ${fileId}`);
    }

    try {
      const client = await this.getContainerClient();

      // Create new file from old meta info
      const metaFile = await this.getMeta(fileId);
      const newMetaBlobClient = client.getBlockBlobClient(this.metaFilenameFromId(newFileId));
      const newMeta: FileMetadata = {
        id: newFileId,
        originalName: metaFile.originalName,
        mime: metaFile.mime,
        size: metaFile.size,
        iat: Date.now(),
        md5: metaFile.md5,
      };
      const metaString = JSON.stringify(newMeta, null, 4);
      const metaUploadResponse = await newMetaBlobClient.upload(metaString, metaString.length);
      this.handleUploadResponseError(metaUploadResponse);

      // Copy file
      const fileBlobClient = client.getBlobClient(this.filenameFromId(fileId));
      const fileBlob = await fileBlobClient.download();

      if (!fileBlob.readableStreamBody) {
        throw new Error(`Broken stream`);
      }

      const newFileBlobClient = client.getBlockBlobClient(this.filenameFromId(newFileId));
      const newFileUploadResponse = await newFileBlobClient.uploadStream(
        new Readable().wrap(fileBlob.readableStreamBody),
      );
      this.handleUploadResponseError(newFileUploadResponse);

      return {
        ...newMeta,
      };
    } catch (ex) {
      throw this.handleAzureException(ex);
    }
  }

  async deleteFile(fileId: FileId): Promise<void> {
    this.logger.debug(`deleteFile(${fileId})`);

    if (!(await this.fileExists(fileId))) {
      throw new NotFoundError(`File not found: ${fileId}`);
    }

    try {
      const client = await this.getContainerClient();

      const blobClient = client.getBlobClient(this.metaFilenameFromId(fileId));
      await blobClient.delete();

      const blobClientFile = client.getBlobClient(this.filenameFromId(fileId));
      await blobClientFile.delete();
    } catch (ex) {
      this.handleAzureException(ex);
    }
  }

  // ---

  private async getClient(): Promise<BlobServiceClient> {
    if (this.azClient) {
      return this.azClient;
    }

    // Create a new connection
    const useAzurite = this.configService.azBlob.useAzurite;
    const {
      containerName,
      account,
      accountUrl,
      accountKey,
    } = this.configService.azBlob.credentials;
    this.logger.debug(
      useAzurite ? 'Using local Blog Storage (Azurite)' : 'Connecting to Azure Blob Storage',
    );
    this.logger.debug(`account=${account}, containerName=${containerName}`);

    try {
      const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
      this.azClient = new BlobServiceClient(accountUrl, sharedKeyCredential);

      if (useAzurite) {
        const exists = await this.azClient.getContainerClient(containerName).exists();
        if (!exists) {
          this.logger.debug('Creating development container');
          await this.azClient.createContainer(containerName);
        }
      }
    } catch (ex) {
      this.logger.error('Failed to initialize AzureAdapterService!');
      this.logger.error(ex);
      this.azClient = null;
    }

    if (!this.azClient) {
      throw new Error('Azure access credentials are invalid!');
    }

    return this.azClient;
  }

  private async getContainerClient(): Promise<ContainerClient> {
    if (this.containerClient) {
      return this.containerClient;
    }

    const creds = this.configService.azBlob.credentials;
    this.logger.debug(`getContainerClient: containerName=${creds.containerName}`);
    this.containerClient = (await this.getClient().then(client =>
      client.getContainerClient(creds.containerName),
    )) as ContainerClient;
    return this.containerClient;
  }

  private filenameFromId(fileId: FileId): string {
    return fileId;
  }
  private metaFilenameFromId(fileId: FileId): string {
    return `${fileId}.json`;
  }

  /**
   *
   * @param err
   * @returns
   * @throws Error
   */
  private handleAzureException(err: Error | RestError) {
    if (err instanceof AzureStorageError) {
      throw err;
    }

    if (err instanceof RestError) {
      if (err.statusCode === 404) {
        throw new NotFoundError(`No such file.`);
      }

      throw new AzureStorageError(`Azure storage error: ${err.statusCode}, ${err}`);
    }

    throw new AzureStorageError(`Azure storage error: ${err}`);
  }

  private handleUploadResponseError(
    response: BlockBlobUploadResponse | BlobUploadCommonResponse,
  ): void {
    if (!response) {
      throw new AzureStorageError(`Unexpected empty response while uploading file.`);
    }
    if (response.errorCode) {
      throw new AzureStorageError(`Unexpected error while uploading file: ${response.errorCode}`);
    }
  }

  private handleDownloadResponseError(response: BlobDownloadResponseParsed): void {
    if (!response) {
      throw new AzureStorageError(`Unexpected empty response while downloading file.`);
    }
    if (response.errorCode) {
      throw new AzureStorageError(`Unexpected error while downloading file: ${response.errorCode}`);
    }
  }

  private async getMeta(fileId: FileId): Promise<FileMetadata> {
    try {
      const client = await this.getContainerClient();
      const blobClient = client.getBlobClient(this.metaFilenameFromId(fileId));
      const buffer = await blobClient.downloadToBuffer();

      const fileInfo: FileMetadata = JSON.parse(buffer.toString('utf8'));

      return fileInfo;
    } catch (ex) {
      throw this.handleAzureException(ex);
    }
  }
}
