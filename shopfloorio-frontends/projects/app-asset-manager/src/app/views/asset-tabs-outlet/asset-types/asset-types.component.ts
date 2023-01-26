import { Component, OnInit } from '@angular/core';
import { ModalConfirmComponent, ModalMessageComponent } from '@sio/common';
import { AssetTypeDto } from 'shared/common/models';

import { AssetTabDirective } from '../asset-tab';

@Component({
  selector: 'app-asset-types',
  templateUrl: './asset-types.component.html',
  styleUrls: ['./asset-types.component.scss'],
})
export class AssetTypesComponent extends AssetTabDirective implements OnInit {
  assetTypes: AssetTypeDto[] = [];

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.assetTypes = await this.assetService.getAssetTypes();
  }

  async onDelete(id: string): Promise<void> {
    const confirmed = await this.openConfirmModal();

    if (!confirmed) {
      return;
    }

    try {
      await this.assetService.deleteAssetType(id);
      this.assetTypes = this.assetTypes.filter(assetType => assetType.id !== id);
    } catch (ex) {
      const modal = this.modalService.open(ModalMessageComponent, { centered: true });

      modal.componentInstance.content = {
        title: 'MODALS.DELETE_ASSET_TYPE_ERROR_MESSAGE.TITLE',
        //@ts-ignore
        body: ex.error?.message || 'MODALS.DELETE_ASSET_TYPE_ERROR_MESSAGE.BODY',
        dismiss: 'MODALS.DELETE_ASSET_TYPE_ERROR_MESSAGE.DISMISS',
      };
    }
  }

  preventInteraction(event: Event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  private openConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.TITLE',
      body: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.ABORT',
    };
    return modal.result;
  }
}
