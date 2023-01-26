import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService, TreeNode } from '@sio/common';

@Component({
  selector: 'app-grafana-set-admin',
  templateUrl: './grafana-set-admin.component.html',
  styleUrls: ['./grafana-set-admin.component.scss'],
})
export class GrafanaSetAdminComponent {
  assetTypes$ = this.assetService.getAssetTypes();

  constructor(
    private assetService: AssetService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}

  onTreeNodeSelect(node: TreeNode) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { assetTypeId: node.id },
    });
  }
}
