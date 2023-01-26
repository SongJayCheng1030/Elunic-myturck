import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService, TreeNode } from '@sio/common';

@Component({
  selector: 'app-asset-type-select',
  templateUrl: './asset-type-select.component.html',
  styleUrls: ['./asset-type-select.component.scss'],
})
export class AssetTypeSelectComponent {
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
