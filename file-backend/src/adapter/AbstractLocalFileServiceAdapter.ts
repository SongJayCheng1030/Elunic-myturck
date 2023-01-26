import { FileId } from 'shared/common/models';

import { AbstractFileServiceAdapter } from './AbstractFileServiceAdapter';

export abstract class AbstractLocalFileServiceAdapter extends AbstractFileServiceAdapter {
  MUST_BE_CACHED_LOCALLY = false;

  /**
   * Given a file ID, returns the local absolute path to the file.
   * @param fileId
   */
  abstract getLocalFilePath(fileId: FileId): Promise<string>;
}
