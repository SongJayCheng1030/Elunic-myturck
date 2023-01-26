import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService, TreeNode } from '@sio/common';
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

import { MntMaintenanceExecutionsArchiveTableData } from '../../components/maintenance-executions-archive-table/maintenance-executions-archive-table.component';
import { MntExecutionService } from '../../services';

@Component({
  selector: 'mnt-maintenance-executions-archive',
  templateUrl: './maintenance-executions-archive.component.html',
  styleUrls: ['./maintenance-executions-archive.component.scss'],
})
export class MaintenanceExecutionsArchiveComponent {
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
          completed: true,
        }),
      ).pipe(
        map(executions => {
          const nodes = [node, ...getAllDescendants(node)];
          return executions.map(execution => ({
            ...execution,
            asset: nodes.find(node => node.id === execution.assetId),
          }));
        }),
      ),
    ),
    catchError(() => [] as MntMaintenanceExecutionsArchiveTableData[]),
  );

  completedCount$ = this.getExecutionsCountByState(ExecutionState.COMPLETED);
  partiallyCompletedCount$ = this.getExecutionsCountByState(ExecutionState.PARTIALLY_COMPLETED);

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

  private getExecutionsCountByState(state: ExecutionState): Observable<number> {
    return this.executions$.pipe(
      map(
        executions =>
          (executions as MntMaintenanceExecutionsArchiveTableData[]).filter(
            execution => execution.state === state,
          ).length,
      ),
    );
  }
}
