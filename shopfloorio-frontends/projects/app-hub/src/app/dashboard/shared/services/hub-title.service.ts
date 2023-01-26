import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const HUB_TITLE = 'Hub';

@Injectable({
  providedIn: 'root',
})
export class HubTitleService {
  title = new BehaviorSubject<string>(HUB_TITLE);

  constructor() {}

  getTitle(): Observable<string> {
    return this.title;
  }

  setTitle(title: string): void {
    this.title.next(title);
  }

  resetTitle(): void {
    this.title.next(HUB_TITLE);
  }
}
