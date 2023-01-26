import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'lib-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent implements OnInit {
  @Input()
  list: Array<{ label: string; value: string }> = [];

  @Input()
  defaultLabel = 'Filter';

  @Output()
  selectOption = new EventEmitter();

  open = false;
  selected = '';

  constructor() {}

  ngOnInit(): void {
    this.selected = this.defaultLabel;
  }

  select(value: string) {
    const selected = this.list.find(item => item.value === value);
    if (selected) {
      if (this.selected === selected.label) {
        this.selected = this.defaultLabel;
        this.selectOption.emit(undefined);
        this.open = false;
        return;
      }
      this.selected = selected.label;
      this.selectOption.emit(selected.value);
      this.open = false;
    }
  }
}
