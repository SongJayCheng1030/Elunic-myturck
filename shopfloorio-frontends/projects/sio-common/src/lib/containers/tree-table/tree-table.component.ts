import { ArrayDataSource } from '@angular/cdk/collections';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, ContentChild, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { cloneDeep } from 'lodash';
import { BehaviorSubject } from 'rxjs';

import { FilterPipe } from '../../pipes';
import { EmptyRowDefDirective, HeaderRowDefDirective } from '../table';
import { TableDirective } from '../table/table';
import { TreeNode } from './tree-node';
import { TreeDataRowDefDirective } from './tree-table-row';

@Component({
  selector: 'lib-tree-table',
  templateUrl: './tree-table.component.html',
  styleUrls: ['../table/table.component.scss'],
  providers: [{ provide: TableDirective, useExisting: TreeTableComponent }],
})
export class TreeTableComponent<T> extends TableDirective<T> implements OnInit, OnChanges {
  private filteredNodes$ = new BehaviorSubject<Array<TreeNode<T>>>([]);

  rootNodes: Array<TreeNode<T>> = [];
  treeControl!: NestedTreeControl<TreeNode<T>, string>;
  dataSource = new ArrayDataSource(this.filteredNodes$);

  @Input() getChildren!: (value: T) => T[];
  @Input() getIdentifier!: (value: T) => string;

  @ContentChild(TreeDataRowDefDirective) dataRow!: TreeDataRowDefDirective<T>;
  @ContentChild(EmptyRowDefDirective) emptyRow?: EmptyRowDefDirective;
  @ContentChild(HeaderRowDefDirective) headerRow?: HeaderRowDefDirective;

  @Input() set data(data: T[]) {
    this.updateDataSource(this.buildTree(data), true);
  }

  get data(): T[] {
    return !this.searchTerm ? this.getTreeValue() : [];
  }

  ngOnInit(): void {
    this.searchCols = this.searchCols.map(c => `value.${c}`);
    this.searchMultilangCols = this.searchMultilangCols.map(c => `value.${c}`);

    super.ngOnInit();

    this.treeControl = new NestedTreeControl<TreeNode<T>, string>(n => n.children, {
      trackBy: n => n.id,
    });
  }

  ngOnChanges({ searchTerm }: SimpleChanges): void {
    if (searchTerm && !searchTerm.firstChange) {
      this.updateDataSource(this.rootNodes);
    }
  }

  onDefaultLangChange() {
    super.onDefaultLangChange();

    if (this.searchTerm) {
      this.updateDataSource(this.rootNodes);
    }
  }

  swapNode(node: TreeNode<T>, toIndex: number): void {
    const parentChildren = node.parent?.children || this.rootNodes;
    const targetNode = parentChildren[toIndex];
    const temp = targetNode.meta;

    parentChildren.splice(node.meta.index, 1);
    parentChildren.splice(toIndex, 0, node);

    targetNode.meta = node.meta;
    node.meta = temp;

    this.updateDataSource(cloneDeep(this.rootNodes), true);
  }

  switchParent(node: TreeNode<T>, parentId: string | null): void {
    const newParent = parentId ? this.searchNode(this.rootNodes, parentId) : null;

    const oldParentChildren = node.parent?.children || this.rootNodes;
    oldParentChildren.splice(node.meta.index, 1);

    node.parent = newParent;
    newParent ? newParent.children.push(node) : this.rootNodes.push(node);
    this.updateSubtreeMetadata(newParent?.parent?.children || this.rootNodes);
    this.updateDataSource(cloneDeep(this.rootNodes), true);
  }

  addNodes(parentId: string, items: T[]): void {
    const parent = this.searchNode(this.rootNodes, parentId);

    if (!parent) {
      return;
    }

    parent.children = [
      ...parent.children,
      ...items.map((item, index) => this.mapItemToTreeNode(item, index, items, parent)),
    ];

    this.updateSubtreeMetadata(parent.children);
    this.updateDataSource(cloneDeep(this.rootNodes), true);
  }

  deleteNode(node: TreeNode<T>) {
    const parentChildren = node.parent?.children || this.rootNodes;

    parentChildren.splice(node.meta.index, 1);
    this.updateSubtreeMetadata(parentChildren);
    this.updateDataSource(cloneDeep(this.rootNodes), true);
  }

  private updateSubtreeMetadata(nodes: Array<TreeNode<T>>): void {
    return nodes.forEach((child, index) => {
      child.meta = {
        index,
        isFirst: index === 0,
        isLast: index === nodes.length - 1,
        level: child.parent ? child.parent.meta.level + 1 : 0,
      };

      this.updateSubtreeMetadata(child.children);
    });
  }

  private searchNode(nodes: Array<TreeNode<T>>, nodeId: string): TreeNode<T> | null {
    const stack = [...nodes];

    while (stack.length) {
      const node = stack.shift() as TreeNode<T>;

      if (node.id === nodeId) {
        return node;
      }
      stack.push(...node.children);
    }
    return null;
  }

  private filterTreeData(nodes: Array<TreeNode<T>>): Array<TreeNode<T>> {
    const stack = [...nodes];
    const founds: Array<TreeNode<T>> = [];

    while (stack.length) {
      const node = stack.shift() as TreeNode<T>;

      if (FilterPipe.filterItemBySearchTerm(node, this.searchCols, this.searchTerm)) {
        founds.push({
          ...node,
          children: [],
          disableReposition: true,
          meta: {
            ...node.meta,
            level: 0,
          },
        });
      }
      stack.push(...node.children);
    }
    return founds;
  }

  private updateDataSource(nodes: Array<TreeNode<T>>, updateRoot = false): void {
    this.filteredNodes$.next(this.searchTerm ? this.filterTreeData(nodes) : nodes);
    this.filteredItems$.next(this.filteredNodes$.value.length);

    if (updateRoot) {
      this.rootNodes = nodes;
      if (this.treeControl) {
        this.treeControl.dataNodes = this.rootNodes;
      }
    }
  }

  private buildTree(array: T[], parent?: TreeNode<T>): Array<TreeNode<T>> {
    return array.map((item, index) => {
      const node = this.mapItemToTreeNode(item, index, array, parent);

      node.children = this.buildTree(this.getChildren(node.value), node);
      return node;
    });
  }

  private mapItemToTreeNode(item: T, index: number, array: T[], parent?: TreeNode<T>): TreeNode<T> {
    return {
      id: this.getIdentifier(item),
      value: item,
      children: [],
      parent: parent || null,
      meta: {
        index,
        isFirst: index === 0,
        isLast: index === array.length - 1,
        level: parent ? parent.meta.level + 1 : 0,
      },
    };
  }

  private getTreeValue(nodes = this.rootNodes): T[] {
    return nodes.map(node => {
      const value = node.value;
      const children = this.getChildren(value);

      children.splice(0, children.length, ...this.getTreeValue(node.children));
      return value;
    });
  }
}
