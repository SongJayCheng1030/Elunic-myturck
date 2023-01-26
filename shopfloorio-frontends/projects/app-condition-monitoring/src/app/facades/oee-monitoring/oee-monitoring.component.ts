import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AssetService,
  EnvironmentService,
  InsightDataKpiService,
  Logger,
  TreeNode,
  TreeNodeStatus,
} from '@sio/common';
import { from, Subscription } from 'rxjs';
import { AssetTreeNodeDto } from 'shared/common/models';

@Component({
  selector: 'app-oee-monitoring',
  templateUrl: './oee-monitoring.component.html',
  styleUrls: ['./oee-monitoring.component.scss'],
})
export class OeeMonitoringComponent implements OnInit, OnDestroy {
  private logger = new Logger('OeeMonitoringComponent');

  activeTreeNode?: TreeNode;
  isDetail = false;
  treeNode?: TreeNode[];
  treeNodeStatus?: TreeNodeStatus[];
  selectedAssetId!: string;

  private routeParamsSubs!: Subscription;
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly assetService: AssetService,
    private readonly kpiService: InsightDataKpiService,
    private readonly environment: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.environment.currentAppUrl = 'condition-monitoring/#/oee-monitoring';
    from(this.assetService.getAssetTree()).subscribe(assetTree => {
      this.treeNode = assetTree;
      this.mapTree(this.treeNode, (node, level) => {
        const assetNode = node as AssetTreeNodeDto;

        if (level === 1) {
          const childA = assetNode.children[0];
          const childB = assetNode.children[1];

          if (childA) {
            const name = childA.assetType!.name;
            for (const key of Object.keys(name)) {
              childA.assetType!.name[key] = name[key] + ' CM Equipment';
            }
          }

          if (childB) {
            const name = childB.assetType!.name;
            for (const key of Object.keys(name)) {
              childB.assetType!.name[key] = name[key] + ' CM Conversion Kit';
            }
          }
        }
      });

      this.ensureSelected();
    });

    this.routeParamsSubs = this.activatedRoute.params.subscribe(params => {
      this.logger.info(`Route params change:`, params);
      this.selectedAssetId = params.id;
      this.ensureSelected();
    });

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

    // this.subs = this.kpiService.equipments$.subscribe((allEquipments: string[]) => {
    //   console.log('eq',allEquipments)

    //   let changed = false;
    //   for (let i = 0; i < allEquipments.length; i++) {
    //     if (this.equipments[i].id !== allEquipments[i]) {
    //       this.equipments[i].id = allEquipments[i];
    //       this.equipments[i].name = `${this.equipments[i].name} (${allEquipments[i]})`;
    //       changed = true;
    //     }
    //   }

    //   if (changed) {
    //     const tmp = this.equipments;
    //     this.equipments = [];
    //     setTimeout(() => {
    //       this.equipments = tmp;
    //     }, 0);
    //   }
    // });
  }

  ngOnDestroy() {
    this.routeParamsSubs && this.routeParamsSubs.unsubscribe();
  }

  ensureSelected() {
    if (!this.selectedAssetId && this.treeNode) {
      this.selectedAssetId = this.treeNode[0].id;
    }

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

    this.onTreeNodeSelect(node);
  }

  onTreeNodeSelect(node: TreeNode) {
    this.logger.info(`onTreeNodeSelect:`, node);
    this.router.navigate([`/oee-monitoring/${node.id}`]);
    this.isDetail = !!this.kpiService.isCMAsset(node as AssetTreeNodeDto);
    this.activeTreeNode = node;
  }

  // ---

  private mapTree(
    roots: TreeNode[] | null | undefined,
    mapFn: (node: TreeNode, level: number) => void,
    level = 0,
  ) {
    if (!roots) {
      return;
    }

    for (const root of roots) {
      mapFn(root, level);
      this.mapTree(root.children || [], mapFn, level + 1);
    }
  }
}
