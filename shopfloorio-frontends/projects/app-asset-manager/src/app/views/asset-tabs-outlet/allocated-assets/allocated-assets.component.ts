import { BreakpointState } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  environment,
  ModalConfirmComponent,
  ModalMessageComponent,
  TreeTableComponent,
} from '@sio/common';
import { TreeNode } from 'projects/sio-common/src/lib/containers/tree-table/tree-node';
import { takeUntil } from 'rxjs';
import { AssetDto, AssetTreeNodeDto } from 'shared/common/models';
import { AssetTabDirective } from '../asset-tab';
import { AssetPoolModalComponent } from './asset-pool-modal/asset-pool-modal.component';

export interface AssetHeaderColumn {
  id: string;
  text: string;
}

@Component({
  selector: 'app-allocated-assets',
  templateUrl: './allocated-assets.component.html',
  styleUrls: ['./allocated-assets.component.scss'],
})
export class AllocatedAssetsComponent extends AssetTabDirective implements OnInit {
  loading = true;
  assets: AssetTreeNodeDto[] = [];
  headers: AssetHeaderColumn[] = [
    { id: 'NAME', text: 'VIEWS.ALLOCATED_ASSETS.NAME' },
    { id: 'TYPE', text: 'VIEWS.ALLOCATED_ASSETS.TYPE' },
    { id: 'DOCUMENTS', text: 'VIEWS.ALLOCATED_ASSETS.DOCUMENTS' },
    { id: 'CREATED_OR_UPDATED_AT', text: 'VIEWS.ALLOCATED_ASSETS.CREATED_OR_UPDATED_AT' },
    { id: 'CHANGE_ORDER', text: 'VIEWS.ALLOCATED_ASSETS.CHANGE_ORDER' },
  ];

  columnsToView = ['NAME', 'TYPE', 'ID', 'DOCUMENTS', 'CREATED_OR_UPDATED_AT', 'CHANGE_ORDER'];

  @ViewChild(TreeTableComponent) table!: TreeTableComponent<AssetTreeNodeDto>;

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.assets = await this.assetService.getAssetTree();
    this.loading = false;
    this.addMediaBreakPoints();
  }

  addMediaBreakPoints(): void {
    this.breakpointObserver
      .observe(['(min-width: 1200px)'])
      .pipe(takeUntil(this.destroyed$))
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.columnsToView = [
            'NAME',
            'TYPE',
            'ID',
            'DOCUMENTS',
            'CREATED_OR_UPDATED_AT',
            'CHANGE_ORDER',
          ];
        }
      });

    this.breakpointObserver
      .observe(['(min-width: 700px) and (max-width: 1199px)'])
      .pipe(takeUntil(this.destroyed$))
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.columnsToView = ['NAME', 'TYPE', 'ID', 'DOCUMENTS'];
        }
      });

    this.breakpointObserver
      .observe(['(max-width: 699px)'])
      .pipe(takeUntil(this.destroyed$))
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.columnsToView = ['NAME', 'TYPE', 'ID'];
        }
      });
  }

  isColumnEnable(columnName: string): boolean {
    return this.columnsToView.some(v => v === columnName);
  }

  getIdentifier(asset: AssetTreeNodeDto): string {
    return asset.id;
  }

  getChildren(asset: AssetTreeNodeDto): AssetTreeNodeDto[] {
    return asset.children;
  }

  onExpandAll(expand: boolean) {
    if (expand) {
      this.table?.treeControl?.expandAll();
    } else {
      this.table?.treeControl?.collapseAll();
    }
  }

  async swap(node: TreeNode<AssetTreeNodeDto>, toIndex: number): Promise<void> {
    this.table.swapNode(node, toIndex);

    const siblings = node.parent?.children || this.table.rootNodes;

    try {
      await this.transform(
        node,
        node.parent?.id || null,
        siblings.map(n => n.id),
      );
    } catch (ex) {}
  }

  async switchParent(node: TreeNode<AssetTreeNodeDto>, parentId: string | null): Promise<void> {
    this.table.switchParent(node, parentId);

    try {
      await this.transform(
        node,
        parentId,
        node.children.map(n => n.id),
      );
    } catch (ex) {}
  }

  async openAssetPoolModal(node: TreeNode<AssetTreeNodeDto>): Promise<void> {
    const modal = this.modalService.open(AssetPoolModalComponent, {
      centered: true,
      backdrop: 'static',
    });
    const assets: AssetDto[] = await modal.result;

    if (assets.length) {
      await this.assetService.transformMany(
        assets.map(asset => asset.id),
        node.id,
      );
      this.table.addNodes(
        node.id,
        assets.map(a => ({ ...a, children: [] })),
      );
    }
  }

  onCreateSubAsset(node: TreeNode<AssetTreeNodeDto>) {
    this.router.navigate(['/assets/new'], { queryParams: { parentId: node.id } });
  }

  async clone(node: TreeNode<AssetTreeNodeDto>): Promise<void> {
    if (!node) {
      return this.openInvalidActionModal();
    }

    try {
      const newAsset = await this.assetService.cloneAsset(node.id);
      if (newAsset && node) {
        await this.assetService.transform(newAsset.id, node.parent ? node.parent.id : null);
        this.loading = true;
        this.assets = await this.assetService.getAssetTree();
        this.loading = false;
      }
    } catch (ex) {}
  }

  async deallocate(node: TreeNode<AssetTreeNodeDto>): Promise<void> {
    if (node.children.length > 0) {
      return this.openInvalidActionModal();
    }

    try {
      this.table.deleteNode(node);
      await this.assetService.deallocate(node.id, node.parent?.id || null);
    } catch (ex) {}
  }

  async delete(node: TreeNode<AssetTreeNodeDto>): Promise<void> {
    if (node.children.length > 0) {
      return this.openInvalidActionModal();
    }
    try {
      const confirmed = await this.openConfirmModal();
      if (confirmed) {
        await this.deallocate(node);
        await this.assetService.deleteAsset(node.id);
      }
    } catch (ex) {}
  }

  imageIdToUrl(imageId: string) {
    if (!imageId) return;
    return `${environment.fileServiceUrl}v1/image/${imageId}?w=${this.defaultThumbnailSize.width}&h=${this.defaultThumbnailSize.height}&fit=cover`;
  }

  private async transform(
    node: TreeNode<AssetTreeNodeDto>,
    parentId: string | null,
    order: string[],
  ): Promise<void> {
    await this.assetService.transform(node.id, parentId, order);
  }

  private openInvalidActionModal(): void {
    const modal = this.modalService.open(ModalMessageComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_MESSAGE.TITLE',
      body: 'MODALS.DELETE_ASSET_MESSAGE.BODY',
      dismiss: 'MODALS.DELETE_ASSET_MESSAGE.DISMISS',
    };
  }

  private openConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_CONFIRM.TITLE',
      body: 'MODALS.DELETE_ASSET_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_ASSET_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_ASSET_CONFIRM.ABORT',
    };
    return modal.result;
  }
}
