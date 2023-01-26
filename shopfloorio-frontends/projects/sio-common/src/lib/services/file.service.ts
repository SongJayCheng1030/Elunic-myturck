import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, map, mergeMap, Observable } from 'rxjs';
import { FileData, FileMetaResponse } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';

import { EnvironmentService } from '.';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private fetchUrl = `${this.environment.fileServiceUrl}v1/image/`;

  constructor(private http: HttpClient, private readonly environment: EnvironmentService) {}

  getImgUrl(id: string) {
    return urlJoin(this.fetchUrl, id);
  }

  getFileUrl(id: string, inline = false) {
    return urlJoin(
      this.environment.fileServiceUrl,
      'v1/file',
      id,
      inline ? '?disposition=inline' : '',
    );
  }

  getFileMeta(id: string): Observable<FileMetaResponse> {
    return this.http
      .get<DataResponse<FileMetaResponse>>(urlJoin(this.environment.fileServiceUrl, 'v1/meta', id))
      .pipe(map(response => response.data));
  }

  async uploadFile(file: File): Promise<FileData> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = (await this.http
      .post<DataResponse<FileData>>(`${this.environment.fileServiceUrl}v1/file`, formData)
      .toPromise()) as DataResponse<FileData>;
    return data;
  }

  deleteFile(id: string): Observable<void> {
    return this.http
      .delete(`${this.environment.fileServiceUrl}v1/file/${id}`)
      .pipe(map(() => undefined));
  }

  deleteFiles(ids: string[]): Observable<void> {
    return from(ids).pipe(mergeMap(id => this.deleteFile(id)));
  }
}
