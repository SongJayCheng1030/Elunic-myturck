import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
  ColDef,
  GridApi,
  GridColumnsChangedEvent,
  GridOptions,
  GridReadyEvent,
  GridSizeChangedEvent,
  Module,
} from '@ag-grid-community/core';
import { Directive } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MultilangDirective } from '@sio/common';
import PerfectScrollbar from 'perfect-scrollbar';
import { MultilangValue } from 'shared/common/models';

export const GRID_ROW_HEIGHT = 42;

@Directive()
export abstract class AgGridBaseDirective {
  modules: Module[] = [ClientSideRowModelModule];

  gridBaseOptions: GridOptions = {
    headerHeight: GRID_ROW_HEIGHT,
    rowHeight: GRID_ROW_HEIGHT,
    suppressCellFocus: true,
    onGridSizeChanged: this.onGridSizeChanged,
    onGridColumnsChanged: this.onGridColumnsChanged,
    animateRows: true,
  };

  defaultColDef: ColDef = {
    resizable: true,
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
    suppressMenu: true,
  };

  gridApi!: GridApi;

  constructor(private translate: TranslateService) {}

  onGridReady(params: GridReadyEvent, gridContainer: HTMLElement) {
    const array = ['.ag-body-viewport', ' .ag-body-horizontal-scroll-viewport'];
    array.forEach(element => {
      const container = gridContainer.querySelector(element);
      if (container) {
        const ps = new PerfectScrollbar(container);
        ps.update();
      }
    });

    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onGridSizeChanged(event: GridSizeChangedEvent): void {
    event.api.sizeColumnsToFit();
  }

  onGridColumnsChanged(event: GridColumnsChangedEvent): void {
    event.api.sizeColumnsToFit();
  }

  getMultilangName(value: MultilangValue): string {
    return MultilangDirective.translate(value, this.translate);
  }

  getTranslation(value: string): string {
    return this.translate.instant(value);
  }
}
