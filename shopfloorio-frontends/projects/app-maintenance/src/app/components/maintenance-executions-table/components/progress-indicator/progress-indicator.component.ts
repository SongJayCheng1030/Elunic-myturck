import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'mnt-progress-indicator',
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MntProgressIndicatorComponent implements ICellRendererAngularComp {
  completedSteps!: number;
  totalSteps!: number;

  agInit(params: ICellRendererParams): void {
    this.updateValues(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.updateValues(params);
    return false;
  }

  private updateValues({ data }: ICellRendererParams): void {
    this.completedSteps = data.completedSteps;
    this.totalSteps = data.totalSteps;
  }
}
