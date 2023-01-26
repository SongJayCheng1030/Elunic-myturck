import { IFilterAngularComp, IFloatingFilterAngularComp } from '@ag-grid-community/angular';
import {
  IAfterGuiAttachedParams,
  IDoesFilterPassParams,
  IFilterParams,
  IFloatingFilterParams,
  ValueGetterFunc,
} from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';

export type AgGridListFilterMatcherType = 'string' | 'array';

@Component({
  template: ``,
})
export class AgGridListFloatingFilterSelectOption implements IFilterAngularComp {
  currentFilterValue;
  matcherType: AgGridListFilterMatcherType = 'string';

  private params!: IFilterParams;
  private valueGetter!: ValueGetterFunc;

  agInit(params: IFilterParams & { matcherType: AgGridListFilterMatcherType }): void {
    this.params = params;
    this.currentFilterValue = null;
    this.valueGetter = params.valueGetter;
    if (params.matcherType) {
      this.matcherType = params.matcherType;
    }
  }

  isFilterActive(): boolean {
    return this.currentFilterValue !== null;
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    const valueGetter: any = this.valueGetter;
    const value: any = valueGetter(params);

    if (this.isFilterActive()) {
      if (this.matcherType === 'array') {
        return this.currentFilterValue.every(filterValue => value.includes(filterValue));
      }
      return this.currentFilterValue.includes(value);
    }
    return true;
  }

  getModel(): any {
    return this.isFilterActive() ? this.currentFilterValue : null;
  }

  setModel(model: any): void {
    this.filterChange(model);
  }

  afterGuiAttached(params: IAfterGuiAttachedParams): void {}

  takeValueFromFloatingFilter(value: any): void {
    this.filterChange(value);
  }

  filterChange(newValue: any): void {
    this.currentFilterValue = newValue === '' ? null : newValue;
    this.params.filterChangedCallback();
  }

  onFloatingFilterChanged(type: string, value: any) {
    this.currentFilterValue = value;
    this.filterChange(value);
  }
}

export interface AgGridListFloatingFilterSelectOption {
  bindValue: string;
  bindLabel: string;
}

@UntilDestroy()
@Component({
  selector: 'ag-grid-list-floating-filter',
  templateUrl: './ag-grid-list-floating-filter.component.html',
  styleUrls: ['./ag-grid-list-floating-filter.component.scss'],
})
export class AgGridListFilterComponent implements IFloatingFilterAngularComp {
  params!: IFloatingFilterParams;
  selectedIds = [];
  bindValue;
  bindLabel;
  options = [] as any[];

  agInit(
    params: IFloatingFilterParams & {
      options: any[];
      selectOptions?: AgGridListFloatingFilterSelectOption;
    },
  ): void {
    this.params = params;
    this.options = params.options;
    const selectOptions = params.selectOptions;
    if (selectOptions) {
      this.bindValue = selectOptions.bindValue;
      this.bindLabel = selectOptions.bindLabel;
    }
  }

  onParentModelChanged(parentModel: any) {
    this.selectedIds = !parentModel ? [] : parentModel;
  }

  isFilterActive() {
    return true;
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    return false;
  }

  onFilterSelection() {
    if (!this.selectedIds?.length) {
      // clear the filter
      this.params.parentFilterInstance(instance => {
        instance.onFloatingFilterChanged(null, null);
      });
      return;
    }

    this.params.parentFilterInstance(instance => {
      instance.onFloatingFilterChanged(null, this.selectedIds);
    });
  }
}
