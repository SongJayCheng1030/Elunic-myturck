import { Directive, HostBinding } from '@angular/core';

const PANEL_HEADER_CLASS_NAME = 'panel-header';
const PANEL_HEADER_ACTIONS_CLASS_NAME = 'panel-header-actions';

@Directive({
  selector: 'lib-panel-header',
})
export class PanelHeaderDirective {
  @HostBinding('class') className = PANEL_HEADER_CLASS_NAME;
}

@Directive({
  selector: 'lib-panel-header-actions',
})
export class PanelHeaderActionsDirective {
  @HostBinding('class') className = PANEL_HEADER_ACTIONS_CLASS_NAME;
}
