import { Component, OnInit } from '@angular/core';
import { environment, ModalConfirmComponent, ModalMessageComponent } from '@sio/common';
import { AssetDto, AssetImageMapDto, MultilangValue } from 'shared/common/models';

import { AssetTabDirective } from '../asset-tab';

interface ImageMapTableData {
  id: string;
  firstLinkedName: string | MultilangValue;
  countItems: number;
}

@Component({
  selector: 'app-asset-maps',
  templateUrl: './asset-maps.component.html',
  styleUrls: ['./asset-maps.component.scss'],
})
export class AssetMapsComponent extends AssetTabDirective implements OnInit {
  assetMaps: AssetImageMapDto[] = [];
  tableData: ImageMapTableData[] = [];
  assets: AssetDto[] = [];

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.assets = await this.assetService.getAll();
    this.assetMaps = await this.assetService.getAssetImageMaps();
    this.getTableData();
  }

  getTableData() {
    this.tableData = this.assetMaps.map(imageMap => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const linkedAsset = this.assets.find(asset => asset.imageMap?.id === imageMap.id)!;
      return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: imageMap.id!,
        countItems: imageMap.mapItems?.length ? imageMap.mapItems.length : 0,
        firstLinkedName: linkedAsset ? linkedAsset.name : '-',
      };
    });
  }

  preventInteraction(event: Event): void {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  async onDelete(id: string): Promise<void> {
    const confirmed = await this.openConfirmModal();

    if (!confirmed) {
      return;
    }

    try {
      await this.assetService.deleteAssetMap(id);
      this.assetMaps = this.assetMaps.filter(assetMap => assetMap.id !== id);
      this.getTableData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (ex: any) {
      const modal = this.modalService.open(ModalMessageComponent, { centered: true });

      modal.componentInstance.content = {
        title: 'MODALS.DELETE_ASSET_MAPS_ERROR_MESSAGE.TITLE',
        body: ex.message || 'MODALS.DELETE_ASSET_MAPS_ERROR_MESSAGE.BODY',
        dismiss: 'MODALS.DELETE_ASSET_MAPS_ERROR_MESSAGE.DISMISS',
      };
    }
  }

  imageIdToUrl(imageId: string): string {
    if (!imageId) {
      return '';
    }
    return `${environment.fileServiceUrl}v1/image/${imageId}`;
  }

  private openConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_MAPS_CONFIRM.TITLE',
      body: 'MODALS.DELETE_ASSET_MAPS_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_ASSET_MAPS_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_ASSET_MAPS_CONFIRM.ABORT',
    };
    return modal.result;
  }
}
