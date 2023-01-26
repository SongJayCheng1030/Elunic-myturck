import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { defaultThumbnailSize, TreeNode, TreeNodeStatus } from '../../models';
import { EnvironmentService } from '../../services';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'lib-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() title?: string;
  @Input() treeNode?: TreeNode[];
  @Input() treeNodeStatus?: TreeNodeStatus[];
  @Input() activeTreeNode?: TreeNode;
  @Input() expandAll = true;
  @Output() treeNodeSelect = new EventEmitter<any>();

  defaultThumbnailSize = defaultThumbnailSize;

  nodes?: TreeNode[];
  paths?: TreeNode[] | null;
  minimized = false;
  unsubscribe = new Subject<void>();

  imageBasePath = `${this.environment.fileServiceUrl}v1/image/`;

  constructor(
    private sidebarService: SidebarService,
    private readonly environment: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.nodes = cloneDeep(this.treeNode) || [];
    this.sidebarService.nodes = this.nodes;
    this.notifyActiveTreeNode();
    if (this.expandAll) {
      this.setExpandedState(this.nodes, this.expandAll);
    }
    this.sidebarService.eventsObservable.pipe(takeUntil(this.unsubscribe)).subscribe(action => {
      if (action.minimize !== undefined) {
        action.minimize === 'toggle'
          ? this.toggleMinimized()
          : (this.minimized = !!action.minimize);
      }
      if (action.select?.node || action.select?.root) {
        setTimeout(() =>
          this.onSelect(
            action.select?.root
              ? this.nodes?.length
                ? this.nodes[0]
                : undefined
              : action.select?.node || undefined,
            action.select?.silent,
          ),
        );
      }
    });
  }

  imageIdToUrl(imageId: string) {
    return `${this.imageBasePath}${imageId}?w=${this.defaultThumbnailSize.width}&h=${this.defaultThumbnailSize.height}&fit=cover`;
  }

  ngOnDestroy() {
    this.sidebarService.nodes = [];
    this.sidebarService.activeTreeNode.next(null);
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  setExpandedState(nodes: TreeNode[] | undefined, state: boolean) {
    if (nodes) {
      nodes.forEach(node => {
        if (node.children?.length) {
          node.expanded = state;
          this.setExpandedState(node.children, state);
        }
      });
    }
  }

  getPaths(node: TreeNode[] | undefined, id: string) {
    if (!node) {
      return;
    }
    const paths: TreeNode[] = [];
    const parentPath: TreeNode[] = [];

    return (function deepCheck(items: TreeNode[]) {
      if (!items) {
        return;
      }
      Array.isArray(items) &&
        items.forEach((item: TreeNode) => {
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

  onSelect(node: TreeNode | undefined, silent = false) {
    this.activeTreeNode = node;
    this.notifyActiveTreeNode();
    if (!silent) {
      this.treeNodeSelect.emit(node);
    }
  }

  notifyActiveTreeNode() {
    this.sidebarService.activeTreeNode.next(
      this.sidebarService.findNode(this.nodes, this.activeTreeNode?.id),
    );
  }

  toggleOpen() {
    this.sidebarService.emitEvent({ minimize: 'toggle' });
  }

  toggleMinimized() {
    this.minimized = !this.minimized;
    if (this.minimized && this.activeTreeNode) {
      this.paths = this.getPaths(this.nodes, this.activeTreeNode.id)?.reverse();
    }
  }

  toggleExpanded(event: Event, node: TreeNode) {
    event.preventDefault();
    event.stopPropagation();
    if (node.children?.length) {
      node.expanded = !node.expanded;
    }
  }

  treeNodeStatusBy(id: string): TreeNodeStatus | null | undefined {
    if (this.treeNodeStatus) {
      return this.treeNodeStatus.find(node => node.treeNodeId === id);
    }
    return null;
  }

  numSequence(n: number): number[] | null {
    if (n > 0) {
      return Array(n);
    }
    return null;
  }
}
