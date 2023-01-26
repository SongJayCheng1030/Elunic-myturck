import { NgForOfContext } from '@angular/common';
import { Component, Directive, HostBinding, Input, TemplateRef } from '@angular/core';

const ROW_CLASS_NAME = 'table-row';
const ROW_ACTIVE_CLASS_NAME = 'table-row-active';
const ROW_EMPTY_CLASS_NAME = 'table-row-empty';
const ROW_HOVERABLE_CLASS_NAME = 'table-row-hover';

@Component({
  selector: 'lib-row',
  // <span> is required for styling the tree elevated table
  template: `<span></span> <ng-content></ng-content>`,
})
export class RowComponent {
  @HostBinding(`class`) className = ROW_CLASS_NAME;
}

@Directive({
  selector: '[libDataRow]',
})
export class DataRowDirective {
  @HostBinding(`class.${ROW_ACTIVE_CLASS_NAME}`) @Input() active = false;
  @HostBinding(`class.${ROW_HOVERABLE_CLASS_NAME}`) @Input() hoverable = false;
}

@Directive({
  selector: '[libDataRowDef]',
})
export class DataRowDefDirective<T> {
  constructor(public template: TemplateRef<NgForOfContext<T, T[]>>) {}
}

@Directive({
  selector: '[libHeaderRowDef]',
})
export class HeaderRowDefDirective {
  constructor(public template: TemplateRef<void>) {}
}

@Directive({
  selector: '[libEmptyRow]',
})
export class EmptyRowDirective {
  @HostBinding(`class.${ROW_EMPTY_CLASS_NAME}`) empty = true;
}

@Directive({
  selector: '[libEmptyRowDef]',
})
export class EmptyRowDefDirective {
  constructor(public template: TemplateRef<void>) {}
}
