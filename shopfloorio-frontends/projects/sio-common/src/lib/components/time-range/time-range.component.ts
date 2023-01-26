import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateParserFormatter, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

import { CustomDateParserService } from '../../services/custom-date-parser.service';

const DATE_FORMAT = 'DD.MM.YYYY';
const TIME_FORMAT = 'HH:mm:ss';

@Component({
  selector: 'lib-time-range',
  templateUrl: './time-range.component.html',
  styleUrls: ['./time-range.component.scss'],
  providers: [
    { provide: 'dateFormat', useValue: DATE_FORMAT },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserService },
  ],
})
export class TimeRangeComponent implements OnInit, AfterViewInit {
  @Input() set dateRangeCont(range: any) {
    this.dateRange = range;
    this.updateRange();
  }

  @Input() dateRange: any = {};
  @Input() allowLive = false;
  @Input() defaultRange:
    | 'live'
    | 'last24'
    | 'lastWeek'
    | 'lastMonth'
    | 'lastYear'
    | 'custom'
    | null = null;
  @Output() rangeSelect = new EventEmitter<any>();

  @ViewChild('timeRangeDrop')
  dropdown?: NgbDropdown;
  form!: FormGroup;
  timeRange: any = {};
  timePattern = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/;
  previousRanges: any[] = [];

  constructor(private fb: FormBuilder, private dateParser: NgbDateParserFormatter) {}

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.form = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      startTime: [null, [Validators.required, Validators.pattern(this.timePattern)]],
      endTime: [null, [Validators.required, Validators.pattern(this.timePattern)]],
    });

    this.previousRanges = this.getRangesFromLocalStorage();

    this.updateRange();
    this.patchFormDataByRange();
    this.emitAndClose();
  }

  private updateRange() {
    if (this.dateRange.from || this.dateRange.to) {
      this.timeRange.from = (
        this.dateRange?.from ? moment(this.dateRange.from) : moment()
      ).toISOString();
      this.timeRange.to = (this.dateRange?.to ? moment(this.dateRange.to) : moment()).toISOString();
      this.defaultRange = 'custom';
    } else {
      this.defaultRange = this.allowLive ? 'live' : this.defaultRange;
    }
  }

  get timeRangeText() {
    if (!this.timeRange.from && !this.timeRange.to) return 'Choose timestamp';

    if (this.timeRange.from === this.timeRange.to) return 'Live Data';
    return `${moment(this.timeRange.from).format(DATE_FORMAT) || ''} | ${
      moment(this.timeRange.from).format(TIME_FORMAT) || ''
    }
      - ${moment(this.timeRange.to).format(DATE_FORMAT) || ''} | ${
      moment(this.timeRange.to).format(TIME_FORMAT) || ''
    }`;
  }

  onRange(range: any) {
    this.defaultRange = range;
    this.patchFormDataByRange();
    this.emitAndClose();
  }

  onSubmit() {
    if (this.form.valid) {
      this.defaultRange = 'custom';
      this.patchFormDataByRange(false);
      this.emitAndClose();
      this.updatePreviousRanges();
    }
  }

  onReset() {
    this.onRange(this.allowLive ? 'live' : 'last24');
  }

  patchFormDataByRange(patchFormData = true) {
    if (this.form) {
      if (!this.defaultRange) {
        this.timeRange = {};
        this.form.get('startDate')?.setValue(null);
        this.form.get('startTime')?.setValue(null);
        this.form.get('endDate')?.setValue(null);
        this.form.get('endTime')?.setValue(null);
        return;
      }

      switch (this.defaultRange) {
        case 'live':
          this.timeRange.to = moment().toISOString();
          this.timeRange.from = this.timeRange.to;
          break;
        case 'last24':
          this.timeRange.to = moment().toISOString();
          this.timeRange.from = moment(this.timeRange.to).subtract(1, 'days').toISOString();
          break;
        case 'lastWeek':
          this.timeRange.to = moment().toISOString();
          this.timeRange.from = moment(this.timeRange.to).subtract(7, 'days').toISOString();
          break;
        case 'lastMonth':
          this.timeRange.to = moment().toISOString();
          this.timeRange.from = moment(this.timeRange.to).subtract(1, 'months').toISOString();
          break;
        case 'lastYear':
          this.timeRange.to = moment().toISOString();
          this.timeRange.from = moment(this.timeRange.to).subtract(1, 'years').toISOString();
          break;
        case 'custom':
          if (this.form.valid) {
            const value = this.form.value;
            this.timeRange.to = moment(
              new Date(`${value.endDate} ${value.endTime}`),
              `${DATE_FORMAT} ${TIME_FORMAT}`,
            ).toISOString();

            this.timeRange.from = moment(
              new Date(`${value.startDate} ${value.startTime}`),
              `${DATE_FORMAT} ${TIME_FORMAT}`,
            ).toISOString();
          }
          break;
        default:
          break;
      }

      if (patchFormData) {
        this.form
          .get('startDate')
          ?.setValue(this.dateParser.parse(moment(this.timeRange.from).format(DATE_FORMAT)));
        this.form.get('startTime')?.setValue(moment(this.timeRange.from).format(TIME_FORMAT));
        this.form
          .get('endDate')
          ?.setValue(this.dateParser.parse(moment(this.timeRange.to).format(DATE_FORMAT)));
        this.form.get('endTime')?.setValue(moment(this.timeRange.to).format(TIME_FORMAT));
      }
    }
  }

  onPreviousRangeClick(range: {
    fromDate: string;
    fromTime: string;
    toDate: string;
    toTime: string;
  }) {
    this.defaultRange = 'custom';

    this.form.patchValue({
      endDate: moment(range.toDate, DATE_FORMAT).format('YYYY-MM-DD'),
      endTime: range.toTime,
      startDate: moment(range.fromDate, DATE_FORMAT).format('YYYY-MM-DD'),
      startTime: range.fromTime,
    });
  }

  private updatePreviousRanges() {
    const prev = this.previousRanges.find(
      range => range.to === this.timeRange.to && range.from === this.timeRange.from,
    );

    const range = this.timeRange;
    range.toDate = moment(range.to).format(DATE_FORMAT);
    range.fromDate = moment(range.from).format(DATE_FORMAT);
    range.toTime = moment(range.to).format(TIME_FORMAT);
    range.fromTime = moment(range.from).format(TIME_FORMAT);

    if (!prev) {
      this.previousRanges.unshift(this.timeRange);
      if (this.previousRanges.length > 4) this.previousRanges.pop();
    }

    this.setPreviousRanges(this.previousRanges);
  }

  private getRangesFromLocalStorage(): any[] {
    const ranges = JSON.parse(window.localStorage.getItem('previousRanges') || '[]') as any[];
    return ranges.map(range => {
      range.toDate = moment(range.to).format(DATE_FORMAT);
      range.fromDate = moment(range.from).format(DATE_FORMAT);
      range.toTime = moment(range.to).format(TIME_FORMAT);
      range.fromTime = moment(range.from).format(TIME_FORMAT);
      return range;
    });
  }

  private setPreviousRanges(ranges: any[]) {
    this.previousRanges = ranges;
    const mapped = ranges.map(range => {
      return { to: range.to, from: range.from };
    });
    window.localStorage.setItem('previousRanges', JSON.stringify(mapped));
  }

  emitAndClose() {
    this.rangeSelect.emit(this.timeRange);
    if (this.dropdown) {
      this.dropdown.close();
    }
  }
}
