import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentService, FileService } from '@sio/common';
import {
  CreateDocumentDto,
  CreateDocumentLinkDto,
  CreateDocumentTypeDto,
  DocumentActivityDto,
  DocumentDto,
  DocumentLinkDto,
  DocumentTypeDto,
  GetDocumentsQueryOpts,
} from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private documentsUrl = urlJoin(this.environment.fileServiceUrl, 'v1/documents');
  private documentTypesUrl = urlJoin(this.environment.fileServiceUrl, 'v1/document-types');

  constructor(
    private http: HttpClient,
    private fileService: FileService,
    private readonly environment: EnvironmentService,
  ) {}

  async getDocuments(query: GetDocumentsQueryOpts = { withLinks: false }) {
    const params = this.createHttpQueryParams(query as Record<string, unknown>);
    const { data } = (await this.http
      .get<DataResponse<DocumentDto[]>>(this.documentsUrl, { params })
      .toPromise()) as DataResponse<DocumentDto[]>;
    return data;
  }

  async getDocument(id: string, withLinks = false) {
    const params = this.createHttpQueryParams({ withLinks });
    const { data } = (await this.http
      .get<DataResponse<DocumentDto>>(urlJoin(this.documentsUrl, id), { params })
      .toPromise()) as DataResponse<DocumentDto>;
    return data;
  }

  async getDocumentLinks(id: string) {
    const { data } = (await this.http
      .get<DataResponse<DocumentLinkDto[]>>(urlJoin(this.documentsUrl, id, 'links'))
      .toPromise()) as DataResponse<DocumentLinkDto[]>;
    return data;
  }

  async createDocument(dto: Omit<CreateDocumentDto, 'fileId'>, file: File) {
    const { id } = await this.fileService.uploadFile(file);
    const body: CreateDocumentDto = { ...dto, fileId: id };
    const res = (await this.http
      .post<DataResponse<DocumentDto>>(this.documentsUrl, body)
      .toPromise()) as DataResponse<DocumentDto>;
    return res.data;
  }

  async updateDocument(id: string, dto: Partial<Omit<CreateDocumentDto, 'fileId'>>, file?: File) {
    if (file) {
      const { id: fileId } = await this.fileService.uploadFile(file);
      const body: Partial<CreateDocumentDto> = { ...dto, fileId };
      const res = (await this.http
        .put<DataResponse<DocumentDto>>(this.documentsUrl + `/${id}`, body)
        .toPromise()) as DataResponse<DocumentDto>;
      return res.data;
    }

    const { data } = (await this.http
      .put<DataResponse<DocumentDto>>(this.documentsUrl + `/${id}`, dto)
      .toPromise()) as DataResponse<DocumentDto>;
    return data;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.http.delete<DataResponse<DocumentDto>>(this.documentsUrl + `/${id}`).toPromise();
  }

  async getDocumentActivities(id: string) {
    const { data } = (await this.http
      .get<DataResponse<DocumentActivityDto[]>>(urlJoin(this.documentsUrl, id, 'activities'))
      .toPromise()) as DataResponse<DocumentActivityDto[]>;
    return data;
  }

  async getDocumentTypeActivities(id: string) {
    const { data } = (await this.http
      .get<DataResponse<DocumentActivityDto[]>>(urlJoin(this.documentTypesUrl, id, 'activities'))
      .toPromise()) as DataResponse<DocumentActivityDto[]>;
    return data;
  }

  async getDocumentTypes(name?: string) {
    const params = this.createHttpQueryParams({ name });
    const { data } = (await this.http
      .get<DataResponse<DocumentTypeDto[]>>(urlJoin(this.documentTypesUrl), { params })
      .toPromise()) as DataResponse<DocumentTypeDto[]>;
    return data;
  }

  async getDocumentType(id: string) {
    const { data } = (await this.http
      .get<DataResponse<DocumentTypeDto>>(urlJoin(this.documentTypesUrl, id))
      .toPromise()) as DataResponse<DocumentTypeDto>;
    return data;
  }

  async createDocumentType(dto: CreateDocumentTypeDto) {
    const { data } = (await this.http
      .post<DataResponse<DocumentTypeDto>>(this.documentTypesUrl, dto)
      .toPromise()) as DataResponse<DocumentTypeDto>;
    return data;
  }

  async updateDocumentType(id: string, dto: Partial<CreateDocumentTypeDto>) {
    const { data } = (await this.http
      .put<DataResponse<DocumentTypeDto>>(urlJoin(this.documentTypesUrl, id), dto)
      .toPromise()) as DataResponse<DocumentTypeDto>;
    return data;
  }

  async deleteDocumentType(id: string): Promise<void> {
    await this.http.delete<DataResponse<DocumentDto>>(this.documentTypesUrl + `/${id}`).toPromise();
  }

  async addLink(id: string, dto: CreateDocumentLinkDto) {
    await this.http.post(this.documentsUrl + `/${id}/assign`, dto).toPromise();
  }

  async removeLink(id: string, refId: string) {
    await this.http.delete(this.documentsUrl + `/${id}/unassign/${refId}`).toPromise();
  }

  createHttpQueryParams(params: Record<string, unknown>): Record<string, string> {
    const queryParams: Record<string, string> = {};
    Object.keys(params).forEach(item => {
      if (params[item]) {
        queryParams[item] = String(params[item]);
      }
    });
    return queryParams;
  }
}
