import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AssetDto, ISA95EquipmentHierarchyModelElement } from 'shared/common/models';

import { TreeNode } from '../models';

export interface SidebarSelect {
  node?: TreeNode | null;
  silent?: boolean;
  root?: boolean;
}

export interface SidebarAction {
  minimize?: boolean | 'toggle';
  select?: SidebarSelect;
}

@Injectable({ providedIn: 'root' })
export class SidebarService {
  nodes: TreeNode[] = [];
  activeTreeNode = new BehaviorSubject<TreeNode | undefined | null>(null);
  events = new BehaviorSubject<SidebarAction>({});
  eventsObservable = this.events.asObservable();
  activeTreeNodeObservable = this.activeTreeNode.asObservable();

  emitEvent(action: SidebarAction) {
    this.events.next(action);
  }

  findNode(nodes: TreeNode[] | undefined, id: string | undefined): TreeNode | null {
    if (nodes && id) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
          return nodes[i];
        }
        const node = this.findNode(nodes[i].children || [], id);
        if (node) {
          return node;
        }
      }
    }
    return null;
  }

  collectAssetEquipmentTypeNodes(
    node: TreeNode,
    assets: AssetDto[],
    equipmentType: ISA95EquipmentHierarchyModelElement,
  ) {
    if (
      !assets?.find(asset => asset.id === node.id) &&
      (node as AssetDto)?.assetType?.equipmentType === equipmentType
    ) {
      assets.push(node as AssetDto);
    }
    node?.children?.forEach(child => {
      this.collectAssetEquipmentTypeNodes(child, assets, equipmentType);
    });
  }

  isRootNode(node: TreeNode): boolean {
    for (const root of this.nodes) {
      if (root.id === node.id) {
        return true;
      }
    }
    return false;
  }
}
