import { Component, OnInit } from '@angular/core';
import { environment, ModalConfirmComponent } from '@sio/common';
import { AssetDto, AssetTreeNodeDto } from 'shared/common/models';

import { AssetTabDirective } from '../asset-tab';

@Component({
  selector: 'app-asset-pool',
  templateUrl: './asset-pool.component.html',
  styleUrls: ['./asset-pool.component.scss'],
})
export class AssetPoolComponent extends AssetTabDirective implements OnInit {
  loading = true;
  assets: AssetDto[] = [];
  assetTree: AssetTreeNodeDto[] = [];

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.assets = await this.assetService.getUnassignedAssets();
    this.assetTree = await this.assetService.getAssetTree();
    this.loading = false;
  }

  async transform(id: string, parentId: string) {
    this.removeAsset(id);

    try {
      await this.assetService.transform(id, parentId);
      this.assetTree = await this.assetService.getAssetTree();
    } catch (ex) {}
  }

  async delete(id: string) {
    const confirmed = await this.showConfirmModal();

    if (confirmed) {
      this.removeAsset(id);

      try {
        await this.assetService.deleteAsset(id);
      } catch (ex) {}
    }
  }

  onCreateSubAsset(node: AssetDto) {
    this.router.navigate(['/assets/new'], { queryParams: { parentId: node.id } });
  }

  imageIdToUrl(imageId: string) {
    if (!imageId) return;
    return `${environment.fileServiceUrl}v1/image/${imageId}?w=${this.defaultThumbnailSize.width}&h=${this.defaultThumbnailSize.height}&fit=cover`;
  }

  private removeAsset(id: string) {
    this.assets = this.assets.filter(a => a.id !== id);
  }

  private showConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_CONFIRM.TITLE',
      body: 'MODALS.DELETE_ASSET_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_ASSET_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_ASSET_CONFIRM.ABORT',
    };
    return modal.result;
  }

  async clone(node: AssetDto): Promise<void> {
    try {
      await this.assetService.cloneAsset(node.id);
      this.assets = await this.assetService.getUnassignedAssets();
      this.assetTree = await this.assetService.getAssetTree();
    } catch (ex) {}
  }
}
