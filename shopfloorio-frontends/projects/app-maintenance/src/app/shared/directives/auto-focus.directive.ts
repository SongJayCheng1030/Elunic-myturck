import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[autofocus]',
})
export class AutofocusDirective {
  constructor(private el: ElementRef) {}

  @Input() set autofocus(condition: boolean) {
    if (condition || typeof condition === 'undefined') this.el.nativeElement.focus();
  }
}
