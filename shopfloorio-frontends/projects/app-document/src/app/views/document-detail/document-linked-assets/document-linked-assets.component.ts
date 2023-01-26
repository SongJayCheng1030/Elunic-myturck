import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AssetService, DocumentService, MultilangDirective } from '@sio/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AssetDto,
  AssetTreeNodeDto,
  DocumentDto,
  DocumentLinkDto,
  flattenTrees,
  getAllAncestors,
  MultilangValue,
} from 'shared/common/models';

import { ModalLinkAssetsComponent, ModalLinkAssetsResult } from '../../../modals';

interface Data extends DocumentLinkDto {
  assetName: MultilangValue;
  hierarchy: string;
}

@Component({
  selector: 'app-document-linked-assets',
  templateUrl: './document-linked-assets.component.html',
  styleUrls: ['./document-linked-assets.component.scss'],
})
export class DocumentLinkedAssetsComponent implements OnInit {
  private _links: DocumentLinkDto[] = [];

  private links$ = new BehaviorSubject([] as DocumentLinkDto[]);

  data$ = of([] as Data[]);
  assets: AssetDto[] = [];

  @Input()
  document!: DocumentDto;

  @Input()
  disabled = false;

  @Input()
  set links(links: DocumentLinkDto[]) {
    this._links = links || [];
    this.links$.next(links || []);
  }

  get links() {
    return this._links;
  }

  @Output()
  afterUpdate = new EventEmitter<void>();

  constructor(
    protected modalService: NgbModal,
    protected translate: TranslateService,
    private docService: DocumentService,
    private assetService: AssetService,
  ) {}

  async ngOnInit() {
    const tree = await this.assetService.getAssetTree();
    const unassigned = await this.assetService.getUnassignedAssets();
    this.assets = [...flattenTrees(tree), ...unassigned];

    this.data$ = this.links$.pipe(
      map(links =>
        links.reduce((prev, curr) => {
          const asset = this.assets.find(a => a.id === curr.refId);
          return asset
            ? [
                ...prev,
                { ...curr, assetName: asset.name, hierarchy: this.getHierarchy(asset, tree) },
              ]
            : prev;
        }, [] as Data[]),
      ),
    );
  }

  async openAssetLinkingModal() {
    const modal = this.modalService.open(ModalLinkAssetsComponent, { centered: true });

    (modal.componentInstance as ModalLinkAssetsComponent).content = {
      assets: this.assets,
      links: this.links,
    };
    const result: ModalLinkAssetsResult | undefined = await modal.result;
    const docId = this.document.id;

    if (result && docId) {
      const { added, removed } = result;
      await Promise.all([
        ...added.map(id => this.docService.addLink(docId, { refType: 'asset', refId: id })),
        ...removed.map(id => this.docService.removeLink(docId, id)),
      ]);

      this.afterUpdate.emit();
    }
  }

  private getHierarchy(asset: AssetDto, tree: AssetTreeNodeDto[]) {
    for (const root of tree) {
      const ancestors = getAllAncestors(root, asset);
      if (ancestors.length) {
        return [...ancestors, asset]
          .map(a => MultilangDirective.translate(a.name, this.translate))
          .join(' -> ');
      }
    }

    return MultilangDirective.translate(asset.name, this.translate);
  }
}
