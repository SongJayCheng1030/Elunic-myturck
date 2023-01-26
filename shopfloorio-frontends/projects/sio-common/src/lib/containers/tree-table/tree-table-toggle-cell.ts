import { Component, SkipSelf } from '@angular/core';

import { CellDirective } from '../table';
import { TreeNode } from './tree-node';
import { TreeTableComponent } from './tree-table.component';
import { TreeDataRowDirective } from './tree-table-row';

@Component({
  selector: 'lib-tree-toggle-cell',
  templateUrl: './tree-table-toggle-cell.html',
})
export class TreeToggleCellComponent<T> extends CellDirective {
  private row: TreeDataRowDirective<T>;

  get rowData(): TreeNode<T> {
    return this.row.data;
  }

  get padding(): number {
    return this.row.treeNodePadding;
  }

  get level(): number {
    return this.rowData.meta.level;
  }

  get expandable(): boolean {
    return this.rowData.children.length > 0;
  }

  get isExpanded(): boolean {
    return this.treeTable.treeControl.isExpanded(this.rowData);
  }

  constructor(@SkipSelf() private treeTable: TreeTableComponent<T>) {
    super();
    this.row = TreeDataRowDirective.mostRecentRow as TreeDataRowDirective<T>;
  }

  toggle(): void {
    this.treeTable.treeControl.toggle(this.rowData);
  }
}
