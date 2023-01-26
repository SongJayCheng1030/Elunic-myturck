import {
  Component,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  SkipSelf,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SortOptions } from '../../pipes';
import { TableDirective } from './table';

const CELL_CLASS_NAME = 'table-cell';
const HEADER_CELL_CLASS_NAME = 'table-header-cell';
const HEADER_SORT_CLASS_NAME = 'table-header-sort';

@Directive({
  selector: 'lib-cell',
})
export class CellDirective {
  @HostBinding('class') className = CELL_CLASS_NAME;
  @HostBinding('class.disabled') @Input() disabled = false;
}

@Component({
  selector: 'lib-header-cell',
  template: '<span><ng-content></ng-content></span>',
})
export class HeaderCellComponent {
  @HostBinding('class') className = HEADER_CELL_CLASS_NAME;
  @HostBinding('class.disabled') @Input() disabled = false;
}

@Directive({
  selector: '[libHeaderSort]',
})
export class HeaderSortDirective<T extends TableDirective<T>> implements OnInit, OnDestroy {
  private property!: string;
  private destroyed$ = new Subject<boolean>();

  @Input() isMultilang = false;
  @Input() libHeaderSort!: string;
  @HostBinding('class') className = HEADER_SORT_CLASS_NAME;

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private translateService: TranslateService,
    @SkipSelf() private table: TableDirective<T>,
  ) {}

  ngOnInit(): void {
    this.property = !this.isMultilang
      ? this.libHeaderSort
      : `${this.libHeaderSort}.${this.translateService.defaultLang}`;

    if (this.isMultilang) {
      this.translateService.onDefaultLangChange.pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.property = `${this.libHeaderSort}.${this.translateService.defaultLang}`;
      });
    }

    this.table.sortOptions$.pipe(takeUntil(this.destroyed$)).subscribe((options: SortOptions) => {
      this.renderer.removeClass(this.element.nativeElement, 'asc');
      this.renderer.removeClass(this.element.nativeElement, 'desc');

      if (options.property === this.property) {
        this.renderer.addClass(this.element.nativeElement, options.direction);
      }
    });
  }

  @HostListener('click')
  sort(): void {
    this.table.sortBy(this.property);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
