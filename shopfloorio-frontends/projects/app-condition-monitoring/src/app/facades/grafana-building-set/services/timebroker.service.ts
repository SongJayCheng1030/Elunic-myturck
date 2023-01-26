import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export interface TimeRange {
  from: string;
  to: string;
}

@Injectable({
  providedIn: 'root',
})
export class TimebrokerService {
  private subject: BehaviorSubject<TimeRange> = new BehaviorSubject<TimeRange>({
    from: 'now-5m',
    to: 'now',
  });

  constructor() {}

  get timeRange$(): Observable<TimeRange> {
    return this.subject.asObservable();
  }

  get timeRangeDistinct$(): Observable<TimeRange> {
    return this.timeRange$.pipe(
      distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y)),
    );
  }

  setFromTo(from: string, to: string) {
    this.subject.next({ from, to });
  }
}
