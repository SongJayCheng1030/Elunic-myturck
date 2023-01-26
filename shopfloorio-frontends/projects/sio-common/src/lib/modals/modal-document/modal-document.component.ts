import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FullDocumentDto, GetDocumentsQueryOpts } from 'shared/common/models';
import { DocumentService } from '../../services';

export interface ModalDocumentComponentContent {
  query?: GetDocumentsQueryOpts;
  selectedIds: string[];
}

export interface ModalDocumentComponentResult {
  documents: FullDocumentDto[];
}

@Component({
  selector: 'app-modal-document',
  templateUrl: './modal-document.component.html',
  styleUrls: ['./modal-document.component.scss'],
})
export class ModalDocumentComponent implements OnInit {
  content: ModalDocumentComponentContent = {
    selectedIds: [],
  };
  documents: FullDocumentDto[] = [];

  selection = new SelectionModel<string>(true);

  createDocumentLink = new URL(`/documents/#/documents/new`, window.location.origin);

  constructor(private docService: DocumentService, private modal: NgbActiveModal) {}

  async ngOnInit() {
    this.selection.select(...this.content.selectedIds);

    await this.refreshDocuments();
  }

  close(): void {
    this.modal.close();
  }

  confirm() {
    const result: ModalDocumentComponentResult = {
      documents: this.documents.filter(d => this.selection.isSelected(d.id)),
    };
    this.modal.close(result);
  }

  async refreshDocuments() {
    const [docs, types] = await Promise.all([
      this.docService.getDocuments(this.content.query || {}),
      this.docService.getDocumentTypes(),
    ]);

    this.documents = docs.map(d => ({ ...d, type: types.find(t => t.id === d.typeId) }));
  }
}
