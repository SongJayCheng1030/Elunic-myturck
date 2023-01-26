import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { cloneDeep } from 'lodash';

export interface SingleSelect {
  key: string;
  label: string;
}

@Component({
  selector: 'app-single-select',
  templateUrl: './single-select.component.html',
  styleUrls: ['./single-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SingleSelectComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: SingleSelectComponent,
      multi: true,
    },
  ],
})
export class SingleSelectComponent implements OnInit, ControlValueAccessor {
  @Input() items!: SingleSelect[];
  @Input() readonly = false;
  @Output() changed = new EventEmitter<SingleSelect>();
  value?: SingleSelect;
  filteredItems!: SingleSelect[];

  private disabledState = false;
  private controlOnChange: any = () => {};
  private controlOnTouched: any = () => {};

  @HostBinding('class.disabled') get disabled() {
    return this.readonly || this.disabledState;
  }

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.filteredItems = cloneDeep(this.items);
  }

  onChange(): void {
    this.controlOnTouched();
    this.controlOnChange(this.value);
    this.changed.emit(this.value);
  }

  onSelect(item: SingleSelect, controlChange = true) {
    this.value = item;
    if (controlChange) {
      this.onChange();
    }
    if (item) {
      this.filteredItems = this.items.filter(entry => entry.key !== item.key);
    }
  }

  onOpenChange(event: any) {
    this.controlOnTouched();
  }

  validate({ value }: FormControl) {
    return !value && { invalid: true };
  }

  writeValue(value: SingleSelect): void {
    this.onSelect(value, false);
    this.cd.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.controlOnChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.controlOnTouched = fn;
  }

  setDisabledState(state: boolean): void {
    this.disabledState = state;
    this.cd.markForCheck();
  }
}
