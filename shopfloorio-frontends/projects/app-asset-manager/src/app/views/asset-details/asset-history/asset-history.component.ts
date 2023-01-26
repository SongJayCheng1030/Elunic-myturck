import { Component, Input, OnInit } from '@angular/core';
import { AssetService } from '@sio/common';
import { ActivityLog } from 'shared/common/models';

@Component({
  selector: 'app-asset-history',
  templateUrl: './asset-history.component.html',
  styleUrls: ['./asset-history.component.scss'],
})
export class AssetHistoryComponent implements OnInit {
  activities: ActivityLog[] = [];

  @Input() assetId!: string | null;

  constructor(private assetService: AssetService) {}

  async ngOnInit(): Promise<void> {
    if (this.assetId) {
      this.activities = await this.assetService.getAssetActivities(this.assetId);
    }
  }
}
