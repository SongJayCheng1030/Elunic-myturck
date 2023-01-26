import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AssetService } from '@sio/common';
import { AssetDto } from 'shared/common/models';

@Component({
  selector: 'app-asset-pool-modal',
  templateUrl: './asset-pool-modal.component.html',
  styleUrls: ['./asset-pool-modal.component.scss'],
})
export class AssetPoolModalComponent implements OnInit {
  loading = true;
  assets: AssetDto[] = [];
  indexesToAssign: number[] = [];

  constructor(private modal: NgbActiveModal, private assetService: AssetService) {}

  async ngOnInit(): Promise<void> {
    this.assets = await this.assetService.getUnassignedAssets();
    this.loading = false;
  }

  onSelect(index: number, selected: boolean): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    selected
      ? this.indexesToAssign.push(index)
      : (this.indexesToAssign = this.indexesToAssign.filter(i => i !== index));
  }

  onCancel(): void {
    this.modal.close([]);
  }

  onConfirm(): void {
    this.modal.close(this.indexesToAssign.map(i => this.assets[i]));
  }
}
