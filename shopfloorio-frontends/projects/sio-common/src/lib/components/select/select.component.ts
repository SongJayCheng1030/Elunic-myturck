import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

export interface SelectOption {
  title: string;
  value: string | number | null | object;
}

@Component({
  selector: 'lib-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent implements OnInit, OnDestroy {
  @Input()
  formControl: FormControl | undefined;

  @Input()
  defaultValue = '';

  @Input()
  options: SelectOption[] = [];

  @Output() selectOption = new EventEmitter();

  value = new FormControl('');
  subscriptions: Subscription[] = [];

  constructor() {}

  ngOnInit(): void {
    if (this.formControl) {
      this.value = this.formControl;
    }
    this.value.setValue(this.defaultValue || this.options[0].value);
    this.subscriptions.push(
      this.value.valueChanges.subscribe(v => {
        this.selectOption.emit(v);
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
