import { Directive, HostBinding } from '@angular/core';

const PANEL_BODY_CLASS_NAME = 'chart-panel-body';

@Directive({
  selector: 'app-chart-panel-body',
})
export class ChartPanelBodyDirective {
  @HostBinding('class') className = PANEL_BODY_CLASS_NAME;
}
