import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MultilangValue } from 'shared/common/models';

@Directive({
  selector: '[multilang]',
})
export class MultilangDirective implements OnInit, OnDestroy {
  private value!: MultilangValue | string;
  private destroyed$ = new Subject<void>();
  private formTagNames = ['INPUT', 'TEXTAREA'];

  @Input() set multilang(value: MultilangValue | string) {
    this.value = value;
    this.setInnerText();
  }

  constructor(private translateService: TranslateService, private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.translateService.onDefaultLangChange
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.setInnerText());
  }

  setInnerText() {
    if (this.formTagNames.includes(this.el.nativeElement.tagName)) {
      (this.el.nativeElement as HTMLInputElement).value = MultilangDirective.translate(
        this.value,
        this.translateService,
      );
    } else {
      this.el.nativeElement.innerText = MultilangDirective.translate(
        this.value,
        this.translateService,
      );
    }
  }

  static translate(valueRaw: MultilangValue | string, translateService: TranslateService): string {
    const { defaultLang } = translateService;

    if (typeof valueRaw === 'string') {
      return valueRaw as string;
    }

    const value = valueRaw as MultilangValue;

    if (!value || !Object.keys(value).length) {
      return '';
    }

    if (value[defaultLang]) {
      return value[defaultLang];
    }

    const altKey = defaultLang.replace(/_/g, '-');
    if (value[altKey]) {
      return value[altKey];
    }

    const keys = Object.keys(value);

    for (const key of keys) {
      if (key === 'translate') {
        return translateService.instant(value[key]);
      }
      if (key.toLowerCase().startsWith(defaultLang.toLowerCase())) {
        return value[key];
      }
    }
    return value[keys[0]];
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
