import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TreeNode } from '@sio/common';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
})
export class MonitoringComponent implements OnInit {
  treeNode?: TreeNode[];

  constructor(private readonly router: Router, private readonly activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.treeNode = this.activatedRoute.snapshot.data.assetTree;
  }

  onTreeNodeSelect(node: TreeNode) {
    if (node?.id) {
      this.router.navigate([`/overview/${node.id}`]);
    }
  }
}
