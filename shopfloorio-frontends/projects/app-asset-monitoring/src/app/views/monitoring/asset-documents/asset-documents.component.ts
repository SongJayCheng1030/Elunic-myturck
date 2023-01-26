import { Component, Input } from '@angular/core';
import { EnvironmentService } from '@sio/common';
import { DocumentDto } from 'shared/common/models';

@Component({
  selector: 'app-asset-documents',
  templateUrl: './asset-documents.component.html',
  styleUrls: ['./asset-documents.component.scss'],
})
export class AssetDocumentsComponent {
  @Input() documents: DocumentDto[] = [];

  constructor(private readonly environment: EnvironmentService) {}

  documentIdToUrl(documentId: string) {
    if (!documentId) {
      return;
    }
    return `${this.environment.fileServiceUrl}v1/file/${documentId}`;
  }
}
