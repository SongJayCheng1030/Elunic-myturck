import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as FormData from 'form-data';
import { FileId, FileResponse } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import { AuthInfo } from 'shared/common/types';

import { SharedApiService } from './shared-api.service';
import { SharedService } from './shared-service';

@Injectable()
export class SharedFileService {
  constructor(private readonly sharedApiService: SharedApiService) {}

  /**
   * Uploads a file to the file service and returns the data on success
   *
   * @param authInfo The user token and information to use for the request
   * @param buf The data buffer
   * @param filename The filename incl. extension, REQUIRED (e.g. myfile.jpg)
   * @param mimeType The mime type of the file, REQUIRED
   * @returns The data of the uploaded file or an exception on error
   */
  async uploadFileByBuffer(
    authInfo: AuthInfo,
    buf: Buffer,
    filename = 'file.bin',
    mimeType = 'application/octet-stream',
  ): Promise<FileResponse> {
    const form = new FormData();
    form.append('file', buf, {
      filename,
      contentType: mimeType,
      knownLength: buf.length,
    });

    try {
      const ret = await this.sharedApiService.httpPostOrFail<DataResponse<FileResponse>>(
        authInfo,
        SharedService.FILE_SERVICE,
        '/v1/file',
        form as any,
        {
          headers: form.getHeaders(),
        },
        true,
      );
      return ret.data.data;
    } catch (ex) {
      if (ex.status === 404) {
        throw new NotFoundException(`Failed to upload file: endpoint not existing? Received 404`);
      } else if (ex.status === 400) {
        throw new BadRequestException(
          `Failed to upload file: parameter error (illegal or missing parameter)`,
        );
      }

      // Other error occurred
      throw ex;
    }
  }

  /**
   * Clones a file, identified by `fileId` and returns the id of
   * the newly created and cloned file. If the file does not exist,
   * an error is thrown
   *
   * @param authInfo The user token and information to use for the
   * request
   * @param fileId The id of the file to clone
   * @param privileged If the operation should not consider any rights checks.
   * (If I use this argument, I confirm that I know what I do)
   * @returns The id of the cloned file
   */
  async cloneFileByIdOrFail(
    authInfo: AuthInfo,
    fileId: FileId,
    privileged = false,
  ): Promise<FileId> {
    try {
      const resp = await this.sharedApiService.httpGetOrFail<DataResponse<FileResponse>>(
        authInfo,
        SharedService.FILE_SERVICE,
        `v1/copy/${fileId}`,
        {},
        {},
        privileged,
      );

      return resp.data.data.id;
    } catch (ex) {
      if (ex.status === 404) {
        throw new NotFoundException(`Failed to clone file: no such file with id ${fileId}`);
      } else if (ex.status === 400) {
        throw new BadRequestException(`Failed to clone file: missing arguments (see logs)`);
      }

      // Other error occurred
      throw ex;
    }
  }
}
