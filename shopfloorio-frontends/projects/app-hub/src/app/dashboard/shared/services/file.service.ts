import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentService, SharedSessionService } from '@sio/common';
import { FileData } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  fetchUrl = `${this.environment.fileServiceUrl}/v1/thumbnail/`;

  constructor(
    private api: SharedSessionService,
    private readonly environment: EnvironmentService,
  ) {}

  async uploadFile(file: File): Promise<FileData | undefined> {
    const formData = new FormData();
    formData.append('file', file);
    const fileData: HttpResponse<DataResponse<FileData> | null> = await this.api.post(
      `${this.environment.fileServiceUrl}/v1/file`,
      formData,
    );
    return fileData.body?.data;
  }

  async deleteFile(id: string): Promise<void> {
    await this.api.delete(`${this.environment.fileServiceUrl}/v1/file/${id}`);
  }
}
