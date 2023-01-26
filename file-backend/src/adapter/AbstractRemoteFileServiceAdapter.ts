import { FileId } from 'shared/common/models';

import { AbstractFileServiceAdapter } from './AbstractFileServiceAdapter';

export abstract class AbstractRemoteFileServiceAdapter extends AbstractFileServiceAdapter {
  MUST_BE_CACHED_LOCALLY = true;

  /**
   * Downloads the file from storage and store it under the specifed targetPath
   * @param fileId
   * @param targetPath
   */
  abstract downloadToFile(fileId: FileId, targetPath: string): Promise<void>;
}
