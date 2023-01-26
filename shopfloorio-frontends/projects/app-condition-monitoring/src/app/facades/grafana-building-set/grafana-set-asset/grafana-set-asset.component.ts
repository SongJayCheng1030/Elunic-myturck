import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActiveAppFacade,
  AssetService,
  EnvironmentService,
  Logger,
  TreeNode,
  TreeNodeStatus,
} from '@sio/common';
import { from, Subscription } from 'rxjs';
import { GrafanaBuildingSetService } from '../services/grafana-building-set.service';

@Component({
  selector: 'app-grafana-set-asset',
  templateUrl: './grafana-set-asset.component.html',
  styleUrls: ['./grafana-set-asset.component.scss'],
})
export class GrafanaSetAssetComponent implements OnInit, OnDestroy {
  assetTypes$ = this.assetService.getAssetTypes();

  private logger = new Logger('GrafanaSetAssetComponent');
  activeTreeNode?: TreeNode;

  treeNode?: TreeNode[];
  treeNodeStatus?: TreeNodeStatus[];
  selectedAssetId!: string;

  private routeParamsSubs!: Subscription;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly assetService: AssetService,
    private readonly gfBuildingSetService: GrafanaBuildingSetService,
    private readonly environment: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.environment.currentAppUrl = 'condition-monitoring/#/alarm-management';
    from(this.assetService.getAssetTree()).subscribe(assetTree => {
      this.treeNode = assetTree;
      this.ensureSelected();
    });
    this.routeParamsSubs = this.activatedRoute.params.subscribe(params => {
      this.logger.info(`Route params change:`, params);
      this.selectedAssetId = params.assetId;
      this.ensureSelected();
    });

    const routeData = this.router.config.find(r => r.path === this.router.url.split('/')[1])?.data;
    this.gfBuildingSetService.facade = routeData as ActiveAppFacade;

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

  ngOnDestroy() {
    this.routeParamsSubs && this.routeParamsSubs.unsubscribe();
  }

  ensureSelected() {
    if (!this.selectedAssetId) {
      this.selectedAssetId = this.gfBuildingSetService.selectedAssetId
        ? this.gfBuildingSetService.selectedAssetId
        : this.treeNode && this.treeNode.length
        ? this.treeNode[0].id
        : 'unknown';
      this.gfBuildingSetService.selectedAssetId = this.selectedAssetId;
      this.router.navigate(['alarm-management', 'asset', `${this.selectedAssetId}`]);
      return;
    }

    if (!this.selectedAssetId) {
      return;
    }
    this.gfBuildingSetService.selectedAssetId = this.selectedAssetId;

    const _traverse = (roots: TreeNode[], id: string): TreeNode | null => {
      for (const root of roots) {
        if (root.id === id) {
          return root;
        }

        const ret = _traverse(root.children || [], id);
        if (ret) {
          return ret;
        }
      }
      return null;
    };
    const node = _traverse(this.treeNode || [], this.selectedAssetId);

    if (!node) {
      return;
    }

    this.activeTreeNode = node;
  }

  onTreeNodeSelect(node: TreeNode) {
    this.logger.info(`onTreeNodeSelect:`, node);
    this.router.navigate(['alarm-management', 'asset', `${node.id}`]);
    this.activeTreeNode = node;
  }

  // ---

  private mapTree(roots: TreeNode[] | null | undefined, mapFn: (node: TreeNode) => void) {
    if (!roots) {
      return;
    }

    for (const root of roots) {
      mapFn(root);
      this.mapTree(root.children || [], mapFn);
    }
  }
}
