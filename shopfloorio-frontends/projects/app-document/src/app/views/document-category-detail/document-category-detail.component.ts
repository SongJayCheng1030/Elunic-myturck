import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentService, ModalConfirmComponent, ModalMessageComponent } from '@sio/common';
import { from, of } from 'rxjs';
import { DocumentActivityDto, DocumentDto, DocumentTypeDto } from 'shared/common/models';

@Component({
  selector: 'app-document-category-detail',
  templateUrl: './document-category-detail.component.html',
  styleUrls: ['./document-category-detail.component.scss'],
})
export class DocumentCategoryDetailComponent implements OnInit {
  docType?: DocumentTypeDto;

  documents$ = of([] as DocumentDto[]);
  activities$ = of([] as DocumentActivityDto[]);

  get editMode() {
    return typeof this.docType?.id === 'string';
  }

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private docService: DocumentService,
    protected modalService: NgbModal,
  ) {
    this.docType = route.snapshot.data.documentType;
  }

  ngOnInit(): void {
    if (this.docType) {
      this.documents$ = from(this.docService.getDocuments({ typeId: this.docType.id }));
      this.activities$ = from(this.docService.getDocumentTypeActivities(this.docType.id));
    }
  }

  async onDelete(id: string): Promise<void> {
    const confirmed = await this.openConfirmModal();
    if (!confirmed) {
      return;
    }

    try {
      await this.docService.deleteDocumentType(id);
      this.router.navigate(['/document-category']);
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 409) {
        const modal = this.modalService.open(ModalMessageComponent, { centered: true });
        modal.componentInstance.content = {
          title: 'MODALS.DELETE_DOCUMENT_TYPE_CONFLICT_MESSAGE.TITLE',
          body: 'MODALS.DELETE_DOCUMENT_TYPE_CONFLICT_MESSAGE.BODY',
          dismiss: 'MODALS.DELETE_DOCUMENT_TYPE_CONFLICT_MESSAGE.DISMISS',
        };
      }
      throw e;
    }
  }

  private openConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_DOCUMENT_TYPE_CONFIRM.TITLE',
      body: 'MODALS.DELETE_DOCUMENT_TYPE_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_DOCUMENT_TYPE_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_DOCUMENT_TYPE_CONFIRM.ABORT',
    };
    return modal.result;
  }
}
