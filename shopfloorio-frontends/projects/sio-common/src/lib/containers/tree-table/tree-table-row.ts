import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
} from '@angular/core';

import { DataRowDirective } from '../table';
import { TreeNode } from './tree-node';

const TOGGLE_BTN_WIDTH = 46;

@Directive({
  selector: '[libTreeDataRow]',
  exportAs: 'treeDataRow',
})
export class TreeDataRowDirective<T> extends DataRowDirective implements OnInit, OnDestroy {
  // Necessary due to the fact that we cannot get the TreeDataRowDirective via normal DI
  static mostRecentRow: TreeDataRowDirective<unknown> | null = null;

  @Input() treeNodePadding = 16;
  @Input() private libTreeDataRow!: TreeNode<T>;

  get data(): TreeNode<T> {
    return this.libTreeDataRow;
  }

  constructor(private renderer: Renderer2, private element: ElementRef<HTMLElement>) {
    super();
    (TreeDataRowDirective.mostRecentRow as TreeDataRowDirective<T>) = this;
  }

  ngOnInit(): void {
    const leftSpace = TOGGLE_BTN_WIDTH + this.data.meta.level * this.treeNodePadding;
    this.renderer.setStyle(this.element.nativeElement.firstChild, 'left', `${leftSpace}px`);
  }

  ngOnDestroy(): void {
    if (TreeDataRowDirective.mostRecentRow === this) {
      TreeDataRowDirective.mostRecentRow = null;
    }
  }
}

@Directive({
  selector: '[libTreeDataRowDef]',
})
export class TreeDataRowDefDirective<T> {
  constructor(public template: TemplateRef<{ $implicit: TreeNode<T> }>) {}
}
