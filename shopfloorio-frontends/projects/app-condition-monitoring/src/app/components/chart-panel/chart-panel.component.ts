import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chart-panel',
  templateUrl: './chart-panel.component.html',
  styleUrls: ['./chart-panel.component.scss'],
})
export class ChartPanelComponent {
  @Input() scrollable = false;
}
