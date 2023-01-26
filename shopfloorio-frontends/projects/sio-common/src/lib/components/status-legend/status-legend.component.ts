import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-legend',
  templateUrl: './status-legend.component.html',
  styleUrls: ['./status-legend.component.scss'],
})
export class StatusLegendComponent {
  @Input() icon?: string;
  @Input() width = 45;
  @Input() height = 45;
  @Input() bordered = false;
  @Input() backgroundColor = '#e6e6e6';
  @Input() backgroundShape: 'rectangle' | 'circle' = 'rectangle';
  @Input() label?: string;
  @Input() labelPlacement: 'left' | 'right' = 'right';
  @Input() fontSize = 12;
}
