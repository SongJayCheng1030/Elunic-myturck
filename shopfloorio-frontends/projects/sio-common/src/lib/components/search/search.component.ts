import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const SEARCH_CONTROL_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SearchComponent),
  multi: true,
};

@Component({
  selector: 'lib-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [SEARCH_CONTROL_ACCESSOR],
})
export class SearchComponent implements ControlValueAccessor {
  private onTouch!: () => void;
  private onModalChange!: (value: string) => void;

  value = '';

  @Input()
  placeholder = '';

  setValue(value: string): void {
    this.value = value;
    this.onTouch();
    this.onModalChange(value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onModalChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  writeValue(value: string | null): void {
    this.value = value || '';
  }
}
