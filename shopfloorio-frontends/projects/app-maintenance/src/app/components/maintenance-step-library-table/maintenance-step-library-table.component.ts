import { ColDef, GridOptions } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import {
  AgGridActionDropdownComponent,
  AgGridBaseDirective,
  AgGridListFilterComponent,
  AgGridListFloatingFilterSelectOption,
  AgGridTextSearchFloatingFilterComponent,
  GRID_ROW_HEIGHT,
  ModalConfirmComponent,
} from '@sio/common';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { MaintenanceProcedureLibraryStepDto } from 'shared/common/models';

import { MntStepLibraryService } from '../../services';
import { StepTypeNamePipe } from '../../shared/pipes/step-type-name.pipe';
import { MntLibraryStepsQuery } from '../../state/library-steps/libarary-steps.query';
import { MntLibraryStepsService } from '../../state/library-steps/library-steps.service';

@Component({
  selector: 'mnt-maintenance-step-library-table',
  templateUrl: './maintenance-step-library-table.component.html',
  styleUrls: ['./maintenance-step-library-table.component.scss'],
})
export class MaintenanceStepLibraryTableComponent extends AgGridBaseDirective implements OnInit {
  steps$: Observable<MaintenanceProcedureLibraryStepDto[]> = this.libraryStepsQuery.selectAll();

  columnDefs$: Observable<ColDef[]> = from(this.stepLibraryService.listStepTags()).pipe(
    map(stepTags => [
      {
        headerName: 'Title',
        field: 'name',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: AgGridTextSearchFloatingFilterComponent,
      },
      {
        headerName: 'Tags',
        field: 'tags',
        filter: AgGridListFloatingFilterSelectOption,
        filterParams: {
          matcherType: 'array',
        },
        floatingFilter: true,
        floatingFilterComponent: AgGridListFilterComponent,
        floatingFilterComponentParams: {
          options: stepTags.map(({ name }) => name),
        },
        valueFormatter: params => params.value.join(', '),
      },
      {
        headerName: 'Step type',
        field: 'type',
        valueGetter: ({ data }) => {
          return new StepTypeNamePipe(this.translateService).transform(data.type);
        },
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
              callback: id => this.onEdit(id),
            },
            {
              name: 'Delete',
              callback: id => this.onDelete(id),
            },
          ],
        },
        resizable: false,
      },
    ]),
  );

  gridOptions: GridOptions = {
    ...this.gridBaseOptions,
    onCellClicked: event => this.router.navigate(['steps-library', event.data.id]),
    overlayNoRowsTemplate: '<div>No maintenance steps were found</div>',
  };

  constructor(
    protected modalService: NgbModal,
    private stepLibraryService: MntStepLibraryService,
    private libraryStepsService: MntLibraryStepsService,
    private libraryStepsQuery: MntLibraryStepsQuery,
    private router: Router,
    private translateService: TranslateService,
  ) {
    super(translateService);
  }

  ngOnInit(): void {
    this.libraryStepsService.getAllLibrarySteps().subscribe();
  }

  onEdit(id: string): void {
    this.router.navigate(['steps-library', id, 'edit']);
  }

  onDelete(id: string): void {
    from(this.openConfirmModal())
      .pipe(
        switchMap(confirmed =>
          confirmed === 'confirm' ? this.libraryStepsService.deleteLibraryStep(id) : of(null),
        ),
      )
      .subscribe();
  }

  private openConfirmModal(): Promise<string> {
    const modal = this.modalService.open(ModalConfirmComponent, {
      centered: true,
      backdrop: 'static',
    });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_LIBRARY_STEP_CONFIRM.TITLE',
      body: 'MODALS.DELETE_LIBRARY_STEP_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_LIBRARY_STEP_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_LIBRARY_STEP_CONFIRM.ABORT',
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
}
