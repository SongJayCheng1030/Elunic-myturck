import { FileId } from 'shared/common/models';
import { UploadedFileDto } from 'src/file/dto/UploadedFileDto';
import { FileMetadata } from 'src/types';

export abstract class AbstractFileServiceAdapter {
  abstract MUST_BE_CACHED_LOCALLY: boolean;

  /**
   * Given a file ID, returns true or false based on whether the file exists.
   * @param fileId
   */
  abstract fileExists(fileId: FileId): Promise<boolean>;

  /**
   * Given a file ID, returns the file metadata from storage.
   * @param fileId
   */
  abstract getFileMeta(fileId: FileId): Promise<FileMetadata>;

  /**
   * Stores a passed uploaded file under the passed file ID
   *
   * @param newFileId
   * @param newFile
   */
  abstract uploadFile(newFileId: FileId, newFile: UploadedFileDto): Promise<FileMetadata>;

  /**
   * Copy a file identified by fileId under the passed newFileId
   * @param fileId
   * @param newFileId
   */
  abstract copyFile(fileId: FileId, newFileId: FileId): Promise<FileMetadata>;

  /**
   * Delete the file identified by file ID
   * @param fileId
   */
  abstract deleteFile(fileId: FileId): Promise<void>;
}
