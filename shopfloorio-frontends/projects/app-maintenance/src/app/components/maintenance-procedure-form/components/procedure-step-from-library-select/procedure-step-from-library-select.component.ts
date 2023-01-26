import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
  ColDef,
  GridOptions,
  Module,
  RowNode,
  SelectionChangedEvent,
} from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  AgGridBaseDirective,
  AgGridListFilterComponent,
  AgGridListFloatingFilterSelectOption,
  AgGridTextSearchFloatingFilterComponent,
} from '@sio/common';
import { TranslateService } from '@ngx-translate/core';
import { MntStepLibraryService } from 'projects/app-maintenance/src/app/services';
import { from, map, Observable } from 'rxjs';
import { MaintenanceProcedureLibraryStepDto } from 'shared/common/models';

import { MntLibraryStepsQuery } from '../../../../state/library-steps/libarary-steps.query';
import { MntLibraryStepsService } from '../../../../state/library-steps/library-steps.service';

export const ADD_NEW_STEP_RESULT = 'CREATE_STEP';

let showSelected = false;

@Component({
  selector: 'mnt-procedure-step-from-library-select',
  templateUrl: './procedure-step-from-library-select.component.html',
  styleUrls: ['./procedure-step-from-library-select.component.scss'],
})
export class MntProcedureStepFromLibrarySelectComponent
  extends AgGridBaseDirective
  implements OnInit
{
  modules: Module[] = [ClientSideRowModelModule];

  steps$: Observable<MaintenanceProcedureLibraryStepDto[]> = this.libraryStepsQuery.selectAll();

  columnDefs$: Observable<ColDef[]> = from(this.stepLibraryService.listStepTags()).pipe(
    map(tags => [
      {
        field: 'name',
        sortable: true,
        headerCheckboxSelection: true,
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: AgGridTextSearchFloatingFilterComponent,
      },
      {
        field: 'tags',
        filter: AgGridListFloatingFilterSelectOption,
        filterParams: {
          matcherType: 'array',
        },
        floatingFilter: true,
        floatingFilterComponent: AgGridListFilterComponent,
        floatingFilterComponentParams: {
          options: tags.map(({ name }) => name),
        },
        valueFormatter: params => params.value.join(', '),
      },
    ]),
  );

  gridOptions: GridOptions = {
    ...this.gridBaseOptions,
    rowMultiSelectWithClick: true,
    rowSelection: 'multiple',
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPass,
    overlayNoRowsTemplate: '<div>No libarary steps were found</div>',
  };

  selectedSteps = [] as MaintenanceProcedureLibraryStepDto[];
  showSelected = false;

  constructor(
    private modal: NgbActiveModal,
    private stepLibraryService: MntStepLibraryService,
    private libraryStepsService: MntLibraryStepsService,
    private libraryStepsQuery: MntLibraryStepsQuery,
    translate: TranslateService,
  ) {
    super(translate);
  }

  ngOnInit(): void {
    showSelected = false;
    this.libraryStepsService.getAllLibrarySteps().subscribe();
  }

  onCancel(): void {
    this.modal.close();
  }

  addNewStep() {
    this.modal.close(ADD_NEW_STEP_RESULT);
  }

  addSelectedSteps() {
    this.modal.close(this.selectedSteps);
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    this.selectedSteps = event.api.getSelectedRows();
    this.gridApi.onFilterChanged();
  }

  isExternalFilterPresent(): boolean {
    return showSelected;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return node.isSelected() ? true : false;
  }

  onShowSelected(value: boolean) {
    showSelected = value;
    if (showSelected) {
      this.gridApi.setFilterModel(null);
    }
    this.gridApi.onFilterChanged();
  }
}
