import {
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2,
  Self,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MultilangValue } from 'shared/common/models';

import { MultilangDirective } from './multilang.directive';

@Directive({
  selector: '[multilangFormControl]',
})
export class MultilangFormControlDirective
  extends FormControlName
  implements ControlValueAccessor, OnInit, OnDestroy
{
  private multilangValue: MultilangValue = {};
  private destroyed$ = new Subject<void>();

  @Input('multilangFormControl') override name!: string;

  private onTouch!: () => void;
  private onModalChange!: (value: MultilangValue) => void;

  constructor(
    @Optional() protected formGroupDirective: FormGroupDirective,
    @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[],
    private el: ElementRef,
    private fb: FormBuilder,
    private renderer: Renderer2,
    private translateService: TranslateService,
  ) {
    super(formGroupDirective, [], [], valueAccessors, null);
    this.valueAccessor = this;
  }

  ngOnInit(): void {
    this.translateService.onDefaultLangChange
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.updateInputValue());
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    this.onTouch();
    this.updateMultilangValue(value);
    this.onModalChange(this.multilangValue);
  }

  writeValue(value: MultilangValue | null): void {
    if (value) {
      this.multilangValue = value;
      this.updateInputValue();
    }
  }

  registerOnChange(fn: (value: MultilangValue) => void): void {
    this.onModalChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  private updateInputValue(): void {
    const translate = MultilangDirective.translate(this.multilangValue, this.translateService);
    this.renderer.setProperty(this.el.nativeElement, 'value', translate);
  }

  private updateMultilangValue(value: string): void {
    const { defaultLang } = this.translateService;
    const keys = Object.keys(this.multilangValue);

    if (keys.includes(defaultLang)) {
      this.multilangValue[defaultLang] = value;
      return;
    }

    for (const key of keys) {
      if (key.toLowerCase().startsWith(defaultLang.toLowerCase())) {
        this.multilangValue[key] = value;
        return;
      }
    }
    this.multilangValue[defaultLang] = value;
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
