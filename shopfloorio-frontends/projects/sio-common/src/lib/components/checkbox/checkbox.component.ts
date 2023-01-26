import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { v4 as uuid } from 'uuid';

const CHECKBOX_CONTROL_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CheckboxComponent),
  multi: true,
};

@Component({
  selector: 'lib-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [CHECKBOX_CONTROL_ACCESSOR],
})
export class CheckboxComponent implements ControlValueAccessor {
  id = uuid();
  value = false;

  @Input()
  label = '';

  @Input()
  disabled = false;

  @Input()
  set checked(value: boolean) {
    this.value = value;
  }

  get checked() {
    return this.value;
  }

  @Output()
  changed = new EventEmitter<boolean>();

  private onTouch: () => void = () => {};
  private onModalChange: (value: boolean) => void = () => {};

  onChange(): void {
    this.value = !this.value;
    this.onTouch();
    this.onModalChange(this.value);
    this.changed.emit(this.value);
  }

  writeValue(value: boolean): void {
    this.value = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onModalChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
