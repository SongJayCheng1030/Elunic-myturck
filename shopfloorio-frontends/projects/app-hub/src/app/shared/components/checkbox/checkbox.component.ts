import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

export interface CheckboxCobfig {
  title: string;
  defaultChecked: boolean;
}

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
})
export class CheckboxComponent implements OnInit {
  @Input() configs: CheckboxCobfig = {
    title: '',
    defaultChecked: true,
  };

  @Output() changeCheckbox = new EventEmitter<boolean>();

  checkbox = new FormControl(false);

  constructor() {}

  ngOnInit(): void {
    if (this.configs.defaultChecked) {
      this.checkbox.setValue(true);
    }
    this.checkbox.valueChanges.subscribe(value => {
      this.changeCheckbox.emit(value);
    });
  }
}
