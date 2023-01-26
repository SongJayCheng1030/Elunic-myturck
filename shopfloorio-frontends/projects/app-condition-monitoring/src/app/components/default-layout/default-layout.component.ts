import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssetService, TreeNode, TreeNodeStatus } from '@sio/common';

@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
})
export class DefaultLayoutComponent implements OnInit {
  treeNode?: TreeNode[];
  treeNodeStatus?: TreeNodeStatus[];

  constructor(private router: Router, private assetService: AssetService) {}

  async ngOnInit() {
    this.treeNode = await this.assetService.getAssetTree();

    this.assetService.getAssetStatuses().subscribe(assetStatuses => {
      this.treeNodeStatus = Object.keys(assetStatuses).map((id: string) => {
        return {
          treeNodeId: id,
          id: assetStatuses[id].id,
          status: assetStatuses[id].status,
          color: assetStatuses[id].color,
        };
      });
    });
  }

  onTreeNodeSelect(node: TreeNode) {
    if (node) {
      this.router.navigate([
        node.children?.length
          ? `/oee-monitoring/${node.id}`
          : `/oee-monitoring/${node.id}/detail/${node.id}`,
      ]);
    }
  }
}
