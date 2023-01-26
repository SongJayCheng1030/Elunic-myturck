import { Component, EventEmitter, forwardRef, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EnvironmentService } from '@sio/common';
import { DocumentDto } from 'shared/common/models';

import { DocumentModalComponent } from './document-modal/document-modal.component';

const ASSET_DOCUMENTS_CONTROL_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AssetDocumentsComponent),
  multi: true,
};

@Component({
  selector: 'app-asset-documents',
  templateUrl: './asset-documents.component.html',
  styleUrls: ['./asset-documents.component.scss'],
  providers: [ASSET_DOCUMENTS_CONTROL_ACCESSOR],
})
export class AssetDocumentsComponent implements ControlValueAccessor {
  private onTouch!: () => void;
  private onModalChange!: (documents: DocumentDto[]) => void;

  disabled = false;
  documents: DocumentDto[] = [];

  @Output() triggerEditing = new EventEmitter();

  constructor(private modalService: NgbModal, private readonly environment: EnvironmentService) {}

  async onAdd() {
    const doc = await this.openDocumentModal();

    if (doc) {
      this.onTouch();
      this.documents = [...this.documents, doc];
      this.onModalChange(this.documents);
      this.triggerEditing.emit();
    }
  }
  documentIdToUrl(documentId: string) {
    if (!documentId) return;
    return `${this.environment.fileServiceUrl}v1/file/${documentId}`;
  }

  async onEdit(document: DocumentDto, index: number) {
    const doc = await this.openDocumentModal(document);

    if (doc) {
      this.onTouch();
      this.documents = this.documents.map((d, i) => (i === index ? doc : d));
      this.onModalChange(this.documents);
      this.triggerEditing.emit();
    }
  }

  onRemove(index: number) {
    this.onTouch();
    this.documents.splice(index, 1);
    this.onModalChange(this.documents);
    this.triggerEditing.emit();
  }

  writeValue(documents: DocumentDto[]): void {
    this.documents = documents;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  registerOnChange(fn: (documents: DocumentDto[]) => void): void {
    this.onModalChange = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  private openDocumentModal(document?: DocumentDto): Promise<DocumentDto | null> {
    const modal = this.modalService.open(DocumentModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    if (document) {
      modal.componentInstance.mode = 'edit';
      modal.componentInstance.document = document;
    }
    return modal.result;
  }
}
