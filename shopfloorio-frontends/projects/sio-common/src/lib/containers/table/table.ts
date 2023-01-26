import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

import { SortOptions } from '../../pipes';

export interface Row {
  template: object;
}

@Directive()
export abstract class TableDirective<T> implements OnInit, AfterViewInit, OnDestroy {
  protected destroyed$ = new Subject<void>();

  @Input() elevated = false;
  @Input() scrollable = false;
  @Input() searchTerm = '';
  @Input() searchCols: string[] = [];
  @Input() searchMultilangCols: string[] = [];

  @ViewChild('body') tableBodyElement!: ElementRef<HTMLElement>;

  isBodyOverflown = false;
  mutationObserver!: MutationObserver;

  filteredItems$ = new BehaviorSubject<number>(0);
  sortOptions$ = new BehaviorSubject<SortOptions>({
    property: '',
    direction: 'asc',
  });

  abstract data: T[];
  abstract dataRow: Row;
  abstract emptyRow?: Row;
  abstract headerRow?: Row;

  constructor(private translateService: TranslateService) {}

  ngOnInit() {
    this.updateSearchColumns();

    this.translateService.onDefaultLangChange
      .pipe(takeUntil(this.destroyed$), skip(1))
      .subscribe(() => this.onDefaultLangChange());
  }

  protected onDefaultLangChange() {
    this.updateSearchColumns();
  }

  protected updateSearchColumns() {
    this.searchCols = [
      ...this.searchCols.filter(c => !this.searchMultilangCols.some(mc => c.startsWith(mc))),
      ...this.searchMultilangCols.map(c => `${c}.${this.translateService.defaultLang}`),
    ];
  }

  ngAfterViewInit(): void {
    if (this.scrollable) {
      this.mutationObserver = new MutationObserver(() => {
        const { scrollHeight, clientHeight } = this.tableBodyElement.nativeElement;

        this.isBodyOverflown = scrollHeight > clientHeight;
      });

      this.mutationObserver.observe(this.tableBodyElement.nativeElement, {
        childList: true,
      });
    }
  }

  sortBy(prop: string): void {
    const { property, direction } = this.sortOptions$.value;

    if (property === prop) {
      if (direction === 'asc') {
        this.sortOptions$.next({ property, direction: 'desc' });
      } else if (direction === 'desc') {
        this.sortOptions$.next({ property: '', direction: 'asc' });
      }
    } else {
      this.sortOptions$.next({ property: prop, direction: 'asc' });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.mutationObserver?.disconnect();
  }
}
