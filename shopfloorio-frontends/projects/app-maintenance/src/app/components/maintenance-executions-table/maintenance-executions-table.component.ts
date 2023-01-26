import { CellClassParams, ColDef, GridOptions } from '@ag-grid-community/core';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  AgGridActionDropdownComponent,
  AgGridBaseDirective,
  AgGridTextSearchFloatingFilterComponent,
  AssetService,
  GRID_ROW_HEIGHT,
  AgGridListFilterComponent,
  AgGridListFloatingFilterSelectOption,
} from '@sio/common';
import { from, map, shareReplay } from 'rxjs';
import {
  AssetDto,
  AssetTreeNodeDto,
  ExecutionState,
  MaintenanceExecutionDto,
} from 'shared/common/models';

import { MntProgressIndicatorComponent } from './components/progress-indicator/progress-indicator.component';

export interface MntMaintenanceExecutionsTableData extends MaintenanceExecutionDto {
  asset: AssetTreeNodeDto;
  remainingHours: number;
}

@Component({
  selector: 'mnt-maintenance-executions-table',
  templateUrl: './maintenance-executions-table.component.html',
  styleUrls: ['./maintenance-executions-table.component.scss'],
})
export class MaintenanceExecutionsTableComponent extends AgGridBaseDirective {
  gridOptions: GridOptions = {
    ...this.gridBaseOptions,
    onCellClicked: event => this.router.navigate(['executions', event.data.id]),
    overlayNoRowsTemplate: '<div>No executions were found</div>',
  };

  assets$ = from(this.assetService.getAll()).pipe(shareReplay(1));
  columnDefs$ = this.assets$.pipe(map(assets => this.getColumnDefs(assets)));

  @Input() executions!: MntMaintenanceExecutionsTableData[];

  constructor(
    private assetService: AssetService,
    private router: Router,
    translate: TranslateService,
  ) {
    super(translate);
  }

  private getColumnDefs(assets: AssetDto[]): ColDef[] {
    return [
      {
        headerName: 'Title',
        field: 'procedureName',
        pinned: 'left',
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: AgGridTextSearchFloatingFilterComponent,
        sortable: true,
      },
      {
        headerName: 'State',
        field: 'state',
        filter: AgGridListFloatingFilterSelectOption,
        floatingFilter: true,
        floatingFilterComponent: AgGridListFilterComponent,
        floatingFilterComponentParams: {
          options: this.getExecutionStateOptions,
          selectOptions: {
            bindLabel: 'label',
            bindValue: 'value',
          },
        },
        valueFormatter: ({ value }) =>
          this.getTranslation(value ? `EXECUTION.${value}`.toUpperCase() : value),
        cellClass: params => [this.getStateCellClass(params), 'state'],
        sortable: true,
      },
      {
        headerName: 'Remaining hours',
        field: 'remainingHours',
        valueFormatter: ({ data }) => `${data.remainingHours} h`,
        comparator: (valueA, valueB) => {
          if (valueA === valueB) return 0;
          return valueA > valueB ? 1 : -1;
        },
        cellClass: params => [this.getStateCellClass(params)],
        sortable: true,
      },
      {
        headerName: 'Asset',
        field: 'asset.id',
        filter: AgGridListFloatingFilterSelectOption,
        floatingFilter: true,
        floatingFilterComponent: AgGridListFilterComponent,
        floatingFilterComponentParams: {
          options: assets,
          selectOptions: {
            bindValue: 'id',
            bindLabel: 'name',
          },
        },
        valueFormatter: ({ data }) => this.getMultilangName(data.asset.name),
        sortable: true,
      },
      { headerName: 'Maintenance Steps', field: 'totalSteps', sortable: true },
      {
        headerName: 'Progress',
        cellRenderer: MntProgressIndicatorComponent,
        width: 150,
        suppressSizeToFit: true,
      },
      {
        width: GRID_ROW_HEIGHT,
        pinned: 'right',
        suppressSizeToFit: true,
        cellRenderer: AgGridActionDropdownComponent,
        cellClass: 'full-width',
        resizable: false,
      },
    ];
  }

  private getStateCellClass({ data }: CellClassParams): string {
    const { state } = data;
    switch (state) {
      case ExecutionState.DUE_SOON:
        return 'due-soon';
      case ExecutionState.OVER_DUE:
        return 'over-due';
      default:
        return 'open';
    }
  }

  private get getExecutionStateOptions() {
    return [
      { label: 'EXECUTION.DUE_SOON', value: ExecutionState.DUE_SOON, class: 'state-due-soon' },
      { label: 'EXECUTION.OPEN', value: ExecutionState.OPEN },
      { label: 'EXECUTION.OVER_DUE', value: ExecutionState.OVER_DUE, class: 'state-over-due' },
    ];
  }
}
