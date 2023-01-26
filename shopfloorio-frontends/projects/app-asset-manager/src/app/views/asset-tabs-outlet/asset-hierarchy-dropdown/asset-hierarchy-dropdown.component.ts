import { ArrayDataSource } from '@angular/cdk/collections';
import { NestedTreeControl } from '@angular/cdk/tree';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TreeNode } from 'projects/sio-common/src/lib/containers/tree-table/tree-node';
import { AssetTreeNodeDto } from 'shared/common/models';

@Component({
  selector: 'app-asset-hierarchy-dropdown',
  templateUrl: './asset-hierarchy-dropdown.component.html',
  styleUrls: ['./asset-hierarchy-dropdown.component.scss'],
})
export class AssetHierarchyDropdownComponent implements OnInit, AfterViewInit {
  rootNodes!: number;
  dataSource!: ArrayDataSource<AssetTreeNodeDto>;
  treeControl!: NestedTreeControl<AssetTreeNodeDto, string>;

  rootNode: Partial<AssetTreeNodeDto> = {
    children: [],
    name: { translate: 'GENERAL.ROOT_NODE' },
  };

  @Output() selected = new EventEmitter<string>();
  @Input() node?: TreeNode<AssetTreeNodeDto>;
  @Input() placeholder!: string;
  @Input() expandParents = false;
  @Input() set assets(assets: AssetTreeNodeDto[]) {
    if (!this.node || !!this.node.parent) {
      this.rootNode.children = assets;
      assets = [{ ...this.rootNode }] as AssetTreeNodeDto[];
    }

    this.rootNodes = assets.length;
    this.dataSource = new ArrayDataSource(assets);
  }

  ngOnInit(): void {
    this.treeControl = new NestedTreeControl<AssetTreeNodeDto, string>(a => a.children, {
      trackBy: a => a.id,
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.expandParents && this.treeControl && this.rootNode.children && this.node?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.treeControl.expand(this.rootNode as any);
        const paths = this.getPaths(this.rootNode.children, this.node.id) || [];
        paths.forEach(path => {
          if (path.id !== this.node?.id) {
            this.treeControl.expand(path);
          }
        });
      }
    }, 500);
  }

  onSelect(id: string): void {
    this.selected.emit(id);
  }

  getPaths(node: AssetTreeNodeDto[] | undefined, id: string) {
    if (!node) {
      return;
    }
    const paths: AssetTreeNodeDto[] = [];
    const parentPath: AssetTreeNodeDto[] = [];

    return (function deepCheck(items: AssetTreeNodeDto[]) {
      if (!items) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      Array.isArray(items) &&
        items.forEach((item: AssetTreeNodeDto) => {
          parentPath.push(item);
          if (item.id === id) {
            paths.push(...parentPath);
          }
          if (item.children?.length) {
            deepCheck(item.children);
          }
          parentPath.pop();
        });

      return paths;
    })(node);
  }
}
