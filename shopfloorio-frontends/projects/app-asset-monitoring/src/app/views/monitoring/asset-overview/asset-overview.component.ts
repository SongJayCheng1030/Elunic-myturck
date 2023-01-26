import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SidebarService, TreeNode } from '@sio/common';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssetDto, ISA95EquipmentHierarchyModelElement } from 'shared/common/models';

enum OverviewType {
  MAP = 'MAP',
  TILES = 'TILES',
  DETAILS = 'DETAILS',
  NONE = 'NONE',
}

@Component({
  selector: 'app-asset-overview',
  templateUrl: './asset-overview.component.html',
  styleUrls: ['./asset-overview.component.scss'],
})
export class AssetOverviewComponent implements OnInit, OnDestroy {
  asset!: AssetDto;
  overviewType!: OverviewType;
  isImageMapVisible = false;
  activeTreeNode!: TreeNode | null;
  unsubscribe = new Subject<void>();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly sidebarService: SidebarService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
      this.overviewType = OverviewType.NONE;
      setTimeout(() => {
        this.activeTreeNode = this.sidebarService.findNode(this.sidebarService.nodes, params.id);
        if (this.activeTreeNode) {
          this.sidebarService.emitEvent({ select: { node: this.activeTreeNode, silent: true } });
          this.asset = this.activatedRoute.snapshot.data.asset;
          this.isImageMapVisible = !!this.asset.imageMap;
          if (this.asset?.assetType?.equipmentType) {
            switch (this.asset.assetType.equipmentType) {
              case ISA95EquipmentHierarchyModelElement.SITE:
                this.overviewType = OverviewType.TILES;
                break;
              case ISA95EquipmentHierarchyModelElement.AREA:
                this.overviewType = OverviewType.TILES;
                break;
              case ISA95EquipmentHierarchyModelElement.PRODUCTION_LINE:
                this.overviewType = OverviewType.TILES;
                break;
              case ISA95EquipmentHierarchyModelElement.NONE:
                this.overviewType = OverviewType.TILES;
                break;
              case ISA95EquipmentHierarchyModelElement.ENTERPRISE:
                this.overviewType = OverviewType.MAP;
                break;
              case ISA95EquipmentHierarchyModelElement.PRODUCTION_UNIT:
                this.overviewType = OverviewType.DETAILS;
                break;
              default:
                break;
            }
            if (
              this.overviewType === OverviewType.NONE &&
              this.sidebarService.isRootNode(this.activeTreeNode)
            ) {
              this.overviewType = OverviewType.MAP;
            }
          }
        } else {
          this.overviewType = OverviewType.TILES;
        }
      }, 100);
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
