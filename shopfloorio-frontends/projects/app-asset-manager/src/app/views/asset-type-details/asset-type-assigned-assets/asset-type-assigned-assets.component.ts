import { Component, Input, OnInit } from '@angular/core';
import { AssetService } from '@sio/common';
import { AssetDto } from 'shared/common/models';

@Component({
  selector: 'app-asset-type-assigned-assets',
  templateUrl: './asset-type-assigned-assets.component.html',
  styleUrls: ['./asset-type-assigned-assets.component.scss'],
})
export class AssetTypeAssignedAssetsComponent implements OnInit {
  @Input() assetTypeId!: string;

  assets: AssetDto[] = [];

  constructor(private assetService: AssetService) {}

  async ngOnInit(): Promise<void> {
    if (this.assetTypeId) {
      this.assets = (await this.assetService.getAssetType(this.assetTypeId))?.assets || [];
    }
  }
}
