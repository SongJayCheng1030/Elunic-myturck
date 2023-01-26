import { IFloatingFilterAngularComp } from '@ag-grid-community/angular';
import { IFloatingFilterParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

@Component({
  selector: 'ag-grid-text-search-floating-filter',
  templateUrl: './ag-grid-text-search-floating-filter.component.html',
  styleUrls: ['./ag-grid-text-search-floating-filter.component.scss'],
})
export class AgGridTextSearchFloatingFilterComponent implements IFloatingFilterAngularComp {
  currentValue: string | null = null;

  private params!: IFloatingFilterParams;

  agInit(params: IFloatingFilterParams): void {
    this.params = params;
  }

  onParentModelChanged(parentModel: any) {
    if (!parentModel) {
      this.currentValue = null;
    } else {
      this.currentValue = parentModel.filter;
    }
  }

  setFilterValue(value: string) {
    this.currentValue = value;
    if (!this.currentValue) {
      this.params.parentFilterInstance(instance => {
        instance.onFloatingFilterChanged(null, null);
      });
      return;
    }

    this.params.parentFilterInstance(instance => {
      instance.onFloatingFilterChanged('contains', this.currentValue);
    });
  }
}
