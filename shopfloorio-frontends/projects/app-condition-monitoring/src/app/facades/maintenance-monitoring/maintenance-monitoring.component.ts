import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssetService, EnvironmentService, TreeNode, TreeNodeStatus } from '@sio/common';

@Component({
  selector: 'app-maintenance-monitoring',
  templateUrl: './maintenance-monitoring.component.html',
  styleUrls: ['./maintenance-monitoring.component.scss'],
})
export class MaintenanceMonitoringComponent implements OnInit {
  treeNode?: TreeNode[];
  treeNodeStatus?: TreeNodeStatus[];

  constructor(
    private readonly router: Router,
    private readonly assetService: AssetService,
    private readonly environment: EnvironmentService,
  ) {}

  async ngOnInit() {
    this.environment.currentAppUrl = 'condition-monitoring/#/maintenance-monitoring';

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
    if (node && node.id) {
      this.router.navigate([
        `/maintenance-monitoring/${node.children?.length ? 'overview' : 'details'}/${node.id}`,
      ]);
    }
  }
}
