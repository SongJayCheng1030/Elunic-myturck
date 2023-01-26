import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService, TreeNode } from '@sio/common';
import moment from 'moment';
import {
  catchError,
  combineLatest,
  filter,
  from,
  map,
  Observable,
  shareReplay,
  switchMap,
} from 'rxjs';
import {
  AssetTreeNodeDto,
  ExecutionState,
  findAssetsByCriteria,
  getAllDescendants,
} from 'shared/common/models';

import { MntMaintenanceExecutionsTableData } from '../../components/maintenance-executions-table/maintenance-executions-table.component';
import { MntExecutionService } from '../../services';

@Component({
  selector: 'mnt-maintenance-executions',
  templateUrl: './maintenance-executions.component.html',
  styleUrls: ['./maintenance-executions.component.scss'],
})
export class MaintenanceExecutionsComponent {
  treeNodes$ = from(this.assetService.getAssetTree()).pipe(shareReplay()) as Observable<
    AssetTreeNodeDto[]
  >;

  selectedTreeNode$ = combineLatest([
    this.treeNodes$,
    this.activatedRoute.queryParams.pipe(map(params => params['assetId'] as string | undefined)),
  ]).pipe(
    map(([trees, assetId]) => {
      for (const tree of trees) {
        const assets = findAssetsByCriteria(tree, a => a.id === assetId);
        if (assets.length) {
          return assets[0];
        }
      }
      if (trees.length) {
        this.onTreeNodeSelect(trees[0]);
      }
      return undefined;
    }),
  );

  executions$ = this.selectedTreeNode$.pipe(
    filter(node => !!node),
    map(node => node as AssetTreeNodeDto),
    switchMap(node =>
      from(
        this.executionService.getExecutions({
          assetIds: [node.id, ...getAllDescendants(node).map(n => n.id)],
          completed: false,
        }),
      ).pipe(
        map(executions => {
          const now = new Date();
          const nodes = [node, ...getAllDescendants(node)];
          return executions.map(execution => ({
            ...execution,
            asset: nodes.find(node => node.id === execution.assetId),
            remainingHours: Math.round(moment(now).diff(execution.dueDate, 'hours')),
          }));
        }),
      ),
    ),
    catchError(() => [] as MntMaintenanceExecutionsTableData[]),
  );

  openWithDueExecCount$ = this.getOpenExecutionsCount();
  overDueExecutionsCount$ = this.getOverDueExecutionsCount();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private assetService: AssetService,
    private executionService: MntExecutionService,
  ) {}

  onTreeNodeSelect(node: TreeNode) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { assetId: node.id },
    });
  }

  private getOpenExecutionsCount(): Observable<number> {
    return this.executions$.pipe(
      map(
        executions =>
          (executions as MntMaintenanceExecutionsTableData[]).filter(
            execution =>
              execution.state === ExecutionState.OPEN ||
              execution.state === ExecutionState.DUE_SOON,
          ).length,
      ),
    );
  }

  private getOverDueExecutionsCount(): Observable<number> {
    return this.executions$.pipe(
      map(
        executions =>
          (executions as MntMaintenanceExecutionsTableData[]).filter(
            execution => execution.state === ExecutionState.OVER_DUE,
          ).length,
      ),
    );
  }
}
