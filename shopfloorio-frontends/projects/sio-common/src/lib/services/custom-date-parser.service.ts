import { Inject, Injectable, Optional } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

@Injectable({ providedIn: 'root' })
export class CustomDateParserService extends NgbDateParserFormatter {
  dateFormat = 'YYYY-MM-DD';

  constructor(@Optional() @Inject('dateFormat') dateFormat: string) {
    super();
    if (dateFormat) {
      this.dateFormat = dateFormat;
    }
  }

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const d = moment(value.trim(), this.dateFormat);
      return { year: d.year(), month: d.month() + 1, day: d.date() };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    if (!date) {
      return '';
    }
    return moment()
      .year(date.year)
      .month(date.month - 1)
      .date(date.day)
      .format(this.dateFormat);
  }
}
