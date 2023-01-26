import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy } from '@ngneat/until-destroy';
import {
  DocumentService,
  FileService,
  ModalDocumentComponent,
  ModalDocumentComponentContent,
  ModalDocumentComponentResult,
} from '@sio/common';
import { forkJoin } from 'rxjs';
import { DocumentDto } from 'shared/common/models';

const PROCEDURE_STEP_DOCUMENTS_CONTROL_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MntProcedureStepDocumentsFormComponent),
  multi: true,
};

@UntilDestroy()
@Component({
  selector: 'mnt-procedure-step-document-form',
  templateUrl: './procedure-step-document-form.component.html',
  styleUrls: ['./procedure-step-document-form.component.scss'],
  providers: [PROCEDURE_STEP_DOCUMENTS_CONTROL_ACCESSOR],
})
export class MntProcedureStepDocumentsFormComponent implements ControlValueAccessor {
  @Input()
  stepId?: string;

  isDisabled = false;
  documents: DocumentDto[] = [];

  onChange: (docs: string[]) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    private docService: DocumentService,
    private fileService: FileService,
    private modalService: NgbModal,
  ) {}

  writeValue(docIds?: string[]): void {
    if (docIds?.length) {
      forkJoin(docIds.map(id => this.docService.getDocument(id))).subscribe({
        next: docs => (this.documents = docs),
      });
    }
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  trackBy(index: number, doc: DocumentDto): string {
    return doc.id;
  }

  onDeleteDoc(doc: DocumentDto) {
    this.documents = this.documents.filter(d => d.id !== doc.id);
    this.onChange(this.documents.map(d => d.id));
  }

  getDocLink(doc: DocumentDto) {
    return this.fileService.getFileUrl(doc.fileId, true);
  }

  async openDocLinkingModal() {
    const modal = this.modalService.open(ModalDocumentComponent, { centered: true });
    const content: ModalDocumentComponentContent = {
      query: this.stepId ? { refIds: [this.stepId] } : {},
      selectedIds: this.documents.map(d => d.id),
    };
    modal.componentInstance.content = content;

    const result = (await modal.result) as ModalDocumentComponentResult | undefined;
    if (result) {
      this.documents = [...result.documents];
      this.onChange(this.documents.map(d => d.id));
    }
  }
}
