import { Component, Input, OnChanges } from '@angular/core';

import { LinearGaugeConfig } from '../../models/linear-gauge-config';
import { clamp } from '../../util/clamp';

@Component({
  selector: 'app-linear-gauge',
  templateUrl: './linear-gauge.component.html',
  styleUrls: ['./linear-gauge.component.scss'],
})
export class LinearGaugeComponent implements OnChanges {
  private readonly greenColor = '#37c281';
  private readonly warningColor = '#f3bd5b';
  private readonly errorColor = '#fa353c';
  private readonly whiteColor = '#fff';

  @Input()
  value!: number;

  @Input()
  config!: LinearGaugeConfig;

  barColor = this.greenColor;
  warningMarkColor = this.warningColor;
  errorMarkColor = this.errorColor;

  barPercentage = 0;
  warningMarkPercentage = 50;
  errorMarkPercentage = 100;

  ngOnChanges(): void {
    const fullLength = this.config.max - this.config.min;
    this.barPercentage = clamp((100 * (this.value - this.config.min)) / fullLength, 0, 100);
    this.warningMarkPercentage = clamp(
      (100 * (this.config.warning - this.config.min)) / fullLength,
      0,
      100,
    );
    this.errorMarkPercentage = clamp(
      (100 * (this.config.error || 0 - this.config.min)) / fullLength,
      0,
      100,
    );
    if ((this.config.error && this.value >= this.config?.error) || 0) {
      this.barColor = this.errorColor;
      this.warningMarkColor = this.whiteColor;
      this.errorMarkColor = this.whiteColor;
    } else if (this.value >= this.config.warning) {
      this.barColor = this.warningColor;
      this.warningMarkColor = this.whiteColor;
      this.errorMarkColor = this.errorColor;
    } else {
      this.barColor = this.greenColor;
      this.warningMarkColor = this.warningColor;
      this.errorMarkColor = this.errorColor;
    }
  }

  get median(): number {
    return (this.config.min + this.config.max) / 2;
  }
}
