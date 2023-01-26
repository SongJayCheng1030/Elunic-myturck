import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  AssetService,
  DocumentService,
  ModalConfirmComponent,
  ModalMessageComponent,
} from '@sio/common';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { flattenTrees, FullDocumentDto, MultilangValue } from 'shared/common/models';

interface FullDocumentWithAssetDto extends FullDocumentDto {
  assetNames: MultilangValue[];
}

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent implements OnInit, OnDestroy {
  documents: FullDocumentWithAssetDto[] = [];
  private destroyed$ = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    protected modalService: NgbModal,
    private docService: DocumentService,
    private assetService: AssetService,
  ) {}

  async ngOnInit(): Promise<void> {
    const [types, tree, unassigned] = await Promise.all([
      this.docService.getDocumentTypes(),
      this.assetService.getAssetTree(),
      this.assetService.getUnassignedAssets(),
    ]);
    const assets = [...flattenTrees(tree), ...unassigned];
    this.activatedRoute.queryParams
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((params: Params) =>
          this.docService.getDocuments({
            typeId: params.typeId,
            name: params.q,
            refIds: params.refId ? [params.refId] : undefined,
            withLinks: true,
          }),
        ),
      )
      .subscribe(documents => {
        this.documents = documents.map(d => ({
          ...d,
          assetNames: assets.filter(a => d.links?.some(l => l.refId === a.id)).map(a => a.name),
          type: types.find(t => t.id === d.typeId),
        }));
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  goToDetail(id: string) {
    this.router.navigate(['/documents', id]);
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
      await this.docService.deleteDocument(id);
      this.documents = this.documents.filter(document => document.id !== id);
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
