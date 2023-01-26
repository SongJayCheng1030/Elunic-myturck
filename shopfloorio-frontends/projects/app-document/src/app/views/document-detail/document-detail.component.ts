import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentService, ModalConfirmComponent, ModalMessageComponent } from '@sio/common';
import {
  DocumentActivityDto,
  DocumentDto,
  DocumentLinkDto,
  DocumentTypeDto,
} from 'shared/common/models';

@Component({
  selector: 'app-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss'],
})
export class DocumentDetailComponent implements OnInit {
  document?: DocumentDto;
  docType?: DocumentTypeDto;

  assetLinks?: DocumentLinkDto[];
  activities?: DocumentActivityDto[];

  get editMode() {
    return typeof this.document?.id === 'string';
  }

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private docService: DocumentService,
  ) {
    this.document = route.snapshot.data.document;
  }

  async ngOnInit() {
    await this.loadRefs();
    if (this.document) {
      this.docType = await this.docService.getDocumentType(this.document.typeId);
    }
  }

  async loadRefs() {
    if (this.document) {
      this.assetLinks = (await this.docService.getDocumentLinks(this.document.id)).filter(
        l => l.refType === 'asset',
      );
      this.activities = await this.docService.getDocumentActivities(this.document.id);
    }
  }

  async onDelete(id: string): Promise<void> {
    const confirmed = await this.openConfirmModal();
    if (!confirmed) {
      return;
    }

    try {
      await this.docService.deleteDocument(id);
      this.router.navigate(['/documents']);
    } catch (e) {
      if (e instanceof HttpErrorResponse) {
        const modal = this.modalService.open(ModalMessageComponent, { centered: true });

        modal.componentInstance.content = {
          title: 'MODALS.DELETE_DOCUMENT_ERROR_MESSAGE.TITLE',
          body: e.message,
          dismiss: 'MODALS.DELETE_DOCUMENT_ERROR_MESSAGE.DISMISS',
        };
      }
    }
  }

  private openConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_DOCUMENT_CONFIRM.TITLE',
      body: 'MODALS.DELETE_DOCUMENT_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_DOCUMENT_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_DOCUMENT_CONFIRM.ABORT',
    };
    return modal.result;
  }
}
