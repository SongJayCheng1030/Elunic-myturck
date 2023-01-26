import { CellClassParams, ColDef, GridOptions } from '@ag-grid-community/core';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  AgGridBaseDirective,
  AgGridListFilterComponent,
  AgGridListFloatingFilterSelectOption,
  AgGridTextSearchFloatingFilterComponent,
  AssetService,
} from '@sio/common';
import moment from 'moment';
import { from, map, shareReplay } from 'rxjs';
import {
  AssetDto,
  AssetTreeNodeDto,
  ExecutionState,
  MaintenanceExecutionDto,
} from 'shared/common/models';
import { MntGridDateCellRendererComponent } from '../../shared/components/grid-date-cell-renderer/grid-date-cell-renderer.component';
import {
  MntGridDateRangeFloatingFilter,
  MntGridDateRangeFloatingFilterComponent,
} from '../../shared/components/grid-date-range-floating-filter/grid-date-range-floating-filter.component';

export interface MntMaintenanceExecutionsArchiveTableData extends MaintenanceExecutionDto {
  asset: AssetTreeNodeDto;
}

@Component({
  selector: 'mnt-maintenance-executions-archive-table',
  templateUrl: './maintenance-executions-archive-table.component.html',
  styleUrls: ['./maintenance-executions-archive-table.component.scss'],
})
export class MaintenanceExecutionsArchiveTableComponent extends AgGridBaseDirective {
  gridOptions: GridOptions = {
    ...this.gridBaseOptions,
    onCellClicked: event => this.router.navigate(['executions', event.data.id]),
    overlayNoRowsTemplate: '<div>No executions were found</div>',
  };

  assets$ = from(this.assetService.getAll()).pipe(shareReplay(1));
  columnDefs$ = this.assets$.pipe(map(assets => this.getColumnDefs(assets)));

  @Input() executions!: MntMaintenanceExecutionsArchiveTableData[];

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
        sortable: true,
      },
      {
        headerName: 'Planned date of completion',
        field: 'dueDate',
        cellRenderer: MntGridDateCellRendererComponent,
        cellRendererParams: params => ({ date: params.data.dueDate }),
        filter: MntGridDateRangeFloatingFilter,
        floatingFilter: true,
        floatingFilterComponent: MntGridDateRangeFloatingFilterComponent,
        sortable: true,
      },
      {
        headerName: 'Actual date of completion',
        field: 'completedAt',
        cellClass: params => this.getDateCellClass(params),
        cellRenderer: MntGridDateCellRendererComponent,
        cellRendererParams: params => ({ date: params.data.completedAt }),
        filter: MntGridDateRangeFloatingFilter,
        floatingFilter: true,
        floatingFilterComponent: MntGridDateRangeFloatingFilterComponent,
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
    ];
  }

  private getDateCellClass({ data }: CellClassParams): string {
    const { completedAt, dueDate } = data;
    return moment(completedAt).isAfter(dueDate) ? 'date-over-due' : '';
  }

  private get getExecutionStateOptions() {
    return [
      { label: 'EXECUTION.COMPLETED', value: ExecutionState.COMPLETED },
      { label: 'EXECUTION.PARTIALLY_COMPLETED', value: ExecutionState.PARTIALLY_COMPLETED },
    ];
  }
}
