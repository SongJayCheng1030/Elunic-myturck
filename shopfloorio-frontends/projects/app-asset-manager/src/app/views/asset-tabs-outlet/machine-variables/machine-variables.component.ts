import { ColDef, GridOptions } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import {
  AgGridActionDropdownComponent,
  AgGridBaseDirective,
  AgGridListFilterComponent,
  AgGridListFloatingFilterSelectOption,
  AgGridTextSearchFloatingFilterComponent,
  AssetService,
  GRID_ROW_HEIGHT,
  MachineVariablesQuery,
  MachineVariablesService,
} from '@sio/common';
import { combineLatest, from, map, Observable, shareReplay } from 'rxjs';
import { AssetTypeDto, MachineVariableDto } from 'shared/common/models';
import { MachineVariableCreateComponent } from '../../machine-variable-create/machine-variable-create.component';
import { MachineVariableEditComponent } from '../../machine-variable-edit/machine-variable-edit.component';

enum VariablePageModeEnum {
  CREATE = 'create',
}

@Component({
  selector: 'app-machine-variables',
  templateUrl: './machine-variables.component.html',
  styleUrls: ['./machine-variables.component.scss'],
})
export class MachineVariablesComponent extends AgGridBaseDirective implements OnInit {
  gridOptions: GridOptions = {
    ...this.gridBaseOptions,
  };

  private assetTypes$ = from(this.assetService.getAssetTypes()).pipe(shareReplay(1));

  machineVariables$: Observable<MachineVariableDto[]> = combineLatest([
    this.machineVariablesQuery.selectAll(),
    this.assetTypes$,
  ]).pipe(
    map(([machineVariables, assetTypes]) =>
      machineVariables.map(machineVariables => ({
        ...machineVariables,
        assetType: assetTypes.find(assetType => assetType.id === machineVariables.assetTypeId),
      })),
    ),
  );

  columnDefs$ = from(this.assetService.getAssetTypes()).pipe(
    map(assetTypes => this.getColumnDefs(assetTypes)),
  );

  constructor(
    private assetService: AssetService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private machineVariablesService: MachineVariablesService,
    private machineVariablesQuery: MachineVariablesQuery,
    translate: TranslateService,
    config: NgbModalConfig,
  ) {
    super(translate);
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() {
    this.machineVariablesService.getAllMachineVariables().subscribe();
    this.route.queryParams.subscribe(params => {
      if (params.mode === VariablePageModeEnum.CREATE) {
        this.openAddDeviceModal();
      }
    });
  }

  onDelete(id: string): void {
    this.machineVariablesService.deleteLibraryStep(id).subscribe();
  }

  async openAddDeviceModal() {
    const modal = this.modalService.open(MachineVariableCreateComponent, {
      size: 'sm',
      centered: true,
    });
    const success = await modal.result.catch(() => false);
    if (success) {
      return true;
    }
  }

  async openEditDeviceModal(id: string) {
    const modal = this.modalService.open(MachineVariableEditComponent, {
      size: 'sm',
      centered: true,
    });
    modal.componentInstance.variableId = id;
    const success = await modal.result.catch(() => false);
    if (success) {
      return true;
    }
  }

  private getColumnDefs(assetTypes: AssetTypeDto[]): ColDef[] {
    return [
      {
        headerName: 'Name',
        pinned: 'left',
        field: 'name',
        filter: 'agTextColumnFilter',
        floatingFilterComponent: AgGridTextSearchFloatingFilterComponent,
        floatingFilter: true,
        sortable: true,
      },
      {
        headerName: 'Parameter',
        field: 'parameterId',
        filter: 'agTextColumnFilter',
        floatingFilterComponent: AgGridTextSearchFloatingFilterComponent,
        floatingFilter: true,
        sortable: true,
      },
      {
        headerName: 'AssetType',
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
        headerName: 'Unit',
        field: 'unit',
        filter: 'agTextColumnFilter',
        floatingFilterComponent: AgGridTextSearchFloatingFilterComponent,
        floatingFilter: true,
        sortable: true,
      },
      {
        width: GRID_ROW_HEIGHT,
        pinned: 'right',
        suppressSizeToFit: true,
        cellRenderer: AgGridActionDropdownComponent,
        cellClass: 'full-width',
        cellRendererParams: {
          actions: [
            {
              name: 'Edit',
              callback: (id: string) => this.openEditDeviceModal(id),
            },
            {
              name: 'Delete',
              callback: (id: string) => this.onDelete(id),
            },
          ],
        },
        resizable: false,
      },
    ];
  }
}
