import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentService, ModalConfirmComponent, ModalMessageComponent } from '@sio/common';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { DocumentDto, DocumentTypeDto } from 'shared/common/models';

type EnhancedDocumentTypeDto = DocumentTypeDto & { docs: DocumentDto[] };

@Component({
  selector: 'app-document-category',
  templateUrl: './document-category.component.html',
  styleUrls: ['./document-category.component.scss'],
})
export class DocumentCategoryComponent implements OnInit, OnDestroy {
  types: EnhancedDocumentTypeDto[] = [];
  private destroyed$ = new Subject<void>();

  constructor(
    private docService: DocumentService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    protected modalService: NgbModal,
  ) {}

  async ngOnInit() {
    this.activatedRoute.queryParams
      .pipe(
        takeUntil(this.destroyed$),
        switchMap(async (params: Params) => {
          const types = await this.docService.getDocumentTypes(params.q);
          return Promise.all(
            types.map(async t => ({
              ...t,
              docs: await this.docService.getDocuments({ typeId: t.id }),
            })),
          );
        }),
      )
      .subscribe(types => (this.types = types));
  }

  getName(type: EnhancedDocumentTypeDto) {
    return type.name;
  }

  goToDetail(id: string) {
    this.router.navigate(['/document-category', id]);
  }

  preventInDetailMode(event: Event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  async onDelete(id: string): Promise<void> {
    const confirmed = await this.openConfirmModal();

    if (!confirmed) {
      return;
    }

    try {
      await this.docService.deleteDocumentType(id);
      this.types = this.types.filter(types => types.id !== id);
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 409) {
        const modal = this.modalService.open(ModalMessageComponent, { centered: true });

        modal.componentInstance.content = {
          title: 'MODALS.DELETE_DOCUMENT_TYPE_CONFLICT_MESSAGE.TITLE',
          body: 'MODALS.DELETE_DOCUMENT_TYPE_CONFLICT_MESSAGE.BODY',
          dismiss: 'MODALS.DELETE_DOCUMENT_TYPE_CONFLICT_MESSAGE.DISMISS',
        };
      }
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

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
