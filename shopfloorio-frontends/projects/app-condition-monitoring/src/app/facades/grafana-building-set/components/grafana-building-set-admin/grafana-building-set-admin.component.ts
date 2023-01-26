import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import {
  ActiveAppFacade,
  AssetService,
  EnvironmentService,
  Logger,
  MachineVariablesQuery,
  MachineVariablesService,
} from '@sio/common';
import { combineLatest, from, Observable, of, shareReplay } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { AssetTypeDto } from 'shared/common/models';

import { GrafanaBuildingSetService } from '../../services/grafana-building-set.service';

@UntilDestroy()
@Component({
  selector: 'app-grafana-building-set-admin',
  templateUrl: './grafana-building-set-admin.component.html',
  styleUrls: ['./grafana-building-set-admin.component.scss'],
})
export class GrafanaBuildingSetAdminComponent implements OnInit {
  private logger = new Logger('GrafanaBuildingSetComponent');

  assetTypes$ = from(this.assetService.getAssetTypes()).pipe(shareReplay(1));

  selectedAssetTypeId$ = this.activatedRoute.queryParams.pipe(map(params => params.assetTypeId));

  selectedAssetType$: Observable<AssetTypeDto> = combineLatest([
    this.assetTypes$,
    this.selectedAssetTypeId$.pipe(filter(id => !!id)),
  ]).pipe(
    map(
      ([assetTypes, selectedId]) => assetTypes.find(type => type.id === selectedId) as AssetTypeDto,
    ),
  );

  availableMachineVariables$ = this.selectedAssetType$.pipe(
    switchMap(({ id }) =>
      this.machineVariablesQuery.selectAll({
        filterBy: entity => entity.assetTypeId === id,
      }),
    ),
  );

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly assetService: AssetService,
    private readonly gfBuildingSetService: GrafanaBuildingSetService,
    private readonly environment: EnvironmentService,
    private readonly machineVariablesService: MachineVariablesService,
    private readonly machineVariablesQuery: MachineVariablesQuery,
  ) {}

  ngOnInit(): void {
    this.environment.currentAppUrl = 'condition-monitoring/#/alarm-management';

    const routeData = this.router.config.find(r => r.path === this.router.url.split('/')[1])?.data;
    this.gfBuildingSetService.facade = routeData as ActiveAppFacade;

    this.ensureAssetTypeSelection();

    this.machineVariablesService.getAllMachineVariables().subscribe();
  }

  onAssetTypeSelection({ id }: AssetTypeDto) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { assetTypeId: id },
    });
  }

  private ensureAssetTypeSelection() {
    this.selectedAssetTypeId$
      .pipe(
        switchMap(id =>
          !id
            ? this.assetTypes$.pipe(
                tap(assetTypes => {
                  if (assetTypes.length) {
                    this.onAssetTypeSelection(assetTypes[0]);
                  }
                }),
              )
            : of(null),
        ),
        take(1),
      )
      .subscribe();
  }
}
