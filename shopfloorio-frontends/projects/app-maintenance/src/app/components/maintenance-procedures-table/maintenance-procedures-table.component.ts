import { ColDef, GridOptions } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import {
  AgGridActionDropdownComponent,
  AgGridBaseDirective,
  AgGridListFilterComponent,
  AgGridListFloatingFilterSelectOption,
  AgGridTextSearchFloatingFilterComponent,
  AssetService,
  GRID_ROW_HEIGHT,
  ModalConfirmComponent,
} from '@sio/common';
import {
  combineLatest,
  firstValueFrom,
  forkJoin,
  from,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { AssetTypeDto, flattenTrees, MaintenanceProcedureDto } from 'shared/common/models';

import { MntProcedureService } from '../../services';
import {
  ModalAssignMaintenancePlanComponent,
  ModalAssignMaintenancePlanContent,
} from '../../views/modal-assign-maintenance-plan/modal-assign-maintenance-plan.component';

interface MaintenanceProcedureWithAssetType extends MaintenanceProcedureDto {
  assetType: AssetTypeDto;
}

@Component({
  selector: 'mnt-maintenance-procedures-table',
  templateUrl: './maintenance-procedures-table.component.html',
  styleUrls: ['./maintenance-procedures-table.component.scss'],
})
export class MaintenanceProceduresTableComponent extends AgGridBaseDirective {
  private assetTypes$ = from(this.assetService.getAssetTypes()).pipe(shareReplay(1));
  private assetTrees$ = from(this.assetService.getAssetTree()).pipe(shareReplay(1));

  procedures$: Observable<MaintenanceProcedureWithAssetType[]> = forkJoin([
    this.procedureService.getProcedures(),
    this.assetTypes$,
  ]).pipe(
    map(([procedures, assetTypes]) =>
      procedures.map(procedure => ({
        ...procedure,
        assetType: assetTypes.find(type => procedure.assetTypeId === type.id) as AssetTypeDto,
      })),
    ),
  );

  gridOptions: GridOptions = {
    ...this.gridBaseOptions,
    overlayNoRowsTemplate: '<div>No maintenance plans were found</div>',
  };

  columnDefs$ = this.assetTypes$.pipe(map(assetTypes => this.getColumnDefs(assetTypes)));

  constructor(
    private assetService: AssetService,
    private procedureService: MntProcedureService,
    private router: Router,
    private modalService: NgbModal,
    translate: TranslateService,
  ) {
    super(translate);
  }

  private getColumnDefs(assetTypes: AssetTypeDto[]): ColDef[] {
    return [
      {
        headerName: 'Title',
        field: 'name',
        sortable: true,
        pinned: 'left',
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: AgGridTextSearchFloatingFilterComponent,
      },
      {
        headerName: 'Interval',
        valueFormatter: ({ data: { interval, intervalUnit } }) => `${interval} ${intervalUnit}`,
      },
      {
        headerName: 'Assigned asset types',
        field: 'assetType.id',
        filter: AgGridListFloatingFilterSelectOption,
        floatingFilter: true,
        floatingFilterComponent: AgGridListFilterComponent,
        floatingFilterComponentParams: {
          options: assetTypes,
          selectOptions: {
            bindValue: 'id',
            bindLabel: 'name',
          },
        },
        sortable: true,
        valueFormatter: ({ data }) => this.getMultilangName(data.assetType.name),
      },
      {
        headerName: 'Maintenance steps',
        sortable: true,
        valueGetter: ({ data: { steps } }) => steps.length,
      },
      {
        width: GRID_ROW_HEIGHT,
        pinned: 'right',
        suppressSizeToFit: true,
        cellRenderer: AgGridActionDropdownComponent,
        cellRendererParams: {
          actions: [
            { name: 'Edit', callback: id => this.navigateToEdit(id) },
            {
              name: 'Assign',
              callback: id => this.openAssignMaintenancePlanModal(id),
            },
            {
              name: 'Delete',
              callback: id => this.onDelete(id),
            },
          ],
        },
        cellClass: 'full-width',
        resizable: false,
      },
    ];
  }

  getProcedures(): void {
    this.procedures$ = forkJoin([this.procedureService.getProcedures(), this.assetTypes$]).pipe(
      map(([procedures, assetTypes]) =>
        procedures.map(procedure => ({
          ...procedure,
          assetType: assetTypes.find(type => procedure.assetTypeId === type.id) as AssetTypeDto,
        })),
      ),
    );
  }

  onDelete(id: string): void {
    from(this.openConfirmModal())
      .pipe(
        switchMap(confirmed =>
          confirmed === 'confirm' ? this.procedureService.deleteProcedure(id) : of(null),
        ),
      )
      .subscribe(res => {
        this.getProcedures();
      });
  }

  private openConfirmModal(): Promise<string> {
    const modal = this.modalService.open(ModalConfirmComponent, {
      centered: true,
      backdrop: 'static',
    });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_PLANS_CONFIRM.TITLE',
      body: 'MODALS.DELETE_PLANS_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_PLANS_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_PLANS_CONFIRM.ABORT',
      custom: {
        class: 'custom-modal',
        confirmButton: {
          class: 'btn-confirm',
        },
        abortButton: {
          class: 'btn-abort',
        },
      },
    };
    return modal.result;
  }

  private async openAssignMaintenancePlanModal(id: string) {
    const result = await firstValueFrom(
      combineLatest([
        this.assetTrees$,
        this.procedures$,
        this.procedureService.getAssignments(id),
      ]).pipe(
        switchMap(async ([assetTrees, procedures, assignments]) => {
          const procedure = procedures.find(p => p.id === id) as MaintenanceProcedureDto;
          const selected = assignments.map(a => a.assetId);
          const assets = flattenTrees(assetTrees);

          const modal = this.modalService.open(ModalAssignMaintenancePlanComponent, {
            centered: true,
          });
          const content: ModalAssignMaintenancePlanContent = {
            assetTrees,
            selectable: assets.filter(a => a.assetType.id === procedure.assetTypeId).map(a => a.id),
            selected,
          };
          modal.componentInstance.content = content;

          const selectedIds = (await modal.result.catch(() => null)) as string[] | null;
          if (!selectedIds) {
            return null;
          }

          const toAssign = selectedIds.filter(s => !selected.includes(s));
          const toRemove = selected.filter(s => !selectedIds.includes(s));

          return { toAssign, toRemove };
        }),
      ),
    );

    if (result) {
      await Promise.all(result.toRemove.map(r => this.procedureService.unassignProcedure(id, r)));
      await Promise.all(result.toAssign.map(r => this.procedureService.assignProcedure(id, r)));
    }
  }

  private navigateToEdit(id: string) {
    this.router.navigate(['procedures', id, 'edit']);
  }
}
