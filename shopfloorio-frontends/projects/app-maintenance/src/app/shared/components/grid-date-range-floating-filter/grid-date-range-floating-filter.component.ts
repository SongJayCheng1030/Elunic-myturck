import { Component, ViewChild } from '@angular/core';
import { IFilterAngularComp, IFloatingFilterAngularComp } from '@ag-grid-community/angular';
import {
  IDoesFilterPassParams,
  IFilterParams,
  IFloatingFilterParams,
  ValueGetterFunc,
} from '@ag-grid-community/core';
import {
  NgbDate,
  NgbCalendar,
  NgbInputDatepicker,
  NgbDateParserFormatter,
} from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { CustomDateParserService } from '@sio/common';

export interface MntGridDateRangeFloatingFilterRange {
  toDate: Date;
  fromDate: Date;
}

@Component({
  template: ``,
})
export class MntGridDateRangeFloatingFilter implements IFilterAngularComp {
  params!: IFilterParams;
  currentRange: MntGridDateRangeFloatingFilterRange | null = null;
  valueGetter!: ValueGetterFunc;

  agInit(params: IFilterParams): void {
    this.params = params;
    this.valueGetter = params.valueGetter;
  }

  isFilterActive(): boolean {
    return this.currentRange !== null;
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    const valueGetter: any = this.valueGetter;
    const value = moment(valueGetter(params));

    if (this.currentRange && value.isValid()) {
      const startDate = moment(this.currentRange.fromDate);
      const endDate = moment(this.currentRange.toDate).add(1, 'days').subtract(1, 'seconds');
      return value.isBetween(startDate, endDate);
    }
    return true;
  }

  getModel(): MntGridDateRangeFloatingFilterRange | null {
    return this.isFilterActive() ? this.currentRange : null;
  }

  setModel(model: any): void {
    this.filterChange(model);
  }

  takeValueFromFloatingFilter(value: any): void {
    this.filterChange(value);
  }

  filterChange(newValue: MntGridDateRangeFloatingFilterRange): void {
    this.currentRange = newValue;
    this.params.filterChangedCallback();
  }

  onRangeSelect(range: MntGridDateRangeFloatingFilterRange) {
    this.filterChange(range);
  }
}

const DATE_FORMAT = 'DD.MM.YYYY';

@Component({
  selector: 'mnt-grid-date-range-floating-filter',
  templateUrl: './grid-date-range-floating-filter.component.html',
  styleUrls: ['./grid-date-range-floating-filter.component.scss'],
  providers: [
    { provide: 'dateFormat', useValue: DATE_FORMAT },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserService },
  ],
})
export class MntGridDateRangeFloatingFilterComponent implements IFloatingFilterAngularComp {
  @ViewChild('datepicker') datepicker!: NgbInputDatepicker;
  params!: IFloatingFilterParams;
  currentRange: MntGridDateRangeFloatingFilterRange | null = null;
  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = null;
  toDate: NgbDate | null = null;
  parsedDateRange: string | null = null;

  constructor(private parserFormatter: NgbDateParserFormatter, private calendar: NgbCalendar) {
    this.reset();
  }

  agInit(params: IFloatingFilterParams): void {
    this.params = params;
  }

  onParentModelChanged(parentModel: any) {
    if (!parentModel) {
      this.currentRange = null;
    } else {
      this.currentRange = parentModel;
    }
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (
      this.fromDate &&
      !this.toDate &&
      (date.after(this.fromDate) || date.equals(this.fromDate))
    ) {
      this.toDate = date;
      this.parsedDateRange = `${this.parserFormatter.format(
        this.fromDate,
      )} - ${this.parserFormatter.format(this.toDate)}`;
      this.currentRange = {
        toDate: this.parseToDate(this.toDate),
        fromDate: this.parseToDate(this.fromDate),
      };
      this.params.parentFilterInstance((instance: any) => {
        instance.onRangeSelect(this.currentRange);
      });
      this.datepicker.close();
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  onClear() {
    this.reset();
    this.params.parentFilterInstance((instance: any) => {
      instance.onRangeSelect(this.currentRange);
    });
  }

  reset() {
    this.fromDate = this.calendar.getToday();
    this.toDate = null;
    this.currentRange = null;
    this.parsedDateRange = null;
  }

  parseToDate(value: NgbDate): Date {
    return new Date(value.year, value.month - 1, value.day);
  }
}
