import { Directive, HostBinding } from '@angular/core';

const PANEL_HEADER_CLASS_NAME = 'chart-panel-header';
const PANEL_HEADER_ACTIONS_CLASS_NAME = 'chart-panel-header-actions';

@Directive({
  selector: 'app-chart-panel-header',
})
export class ChartPanelHeaderDirective {
  @HostBinding('class') className = PANEL_HEADER_CLASS_NAME;
}

@Directive({
  selector: 'app-chart-panel-header-actions',
})
export class ChartPanelHeaderActionsDirective {
  @HostBinding('class') className = PANEL_HEADER_ACTIONS_CLASS_NAME;
}
