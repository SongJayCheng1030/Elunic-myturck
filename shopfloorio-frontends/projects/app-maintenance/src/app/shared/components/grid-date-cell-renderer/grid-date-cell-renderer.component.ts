import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

interface MntDateCellData extends ICellRendererParams {
  date: Date;
}

@Component({
  selector: 'mnt-grid-date-cell-renderer',
  templateUrl: './grid-date-cell-renderer.component.html',
  styleUrls: ['./grid-date-cell-renderer.component.scss'],
})
export class MntGridDateCellRendererComponent implements ICellRendererAngularComp {
  date!: Date;

  agInit(params: MntDateCellData) {
    this.date = params.date;
  }

  refresh(params: MntDateCellData) {
    this.date = params.date;
    return true;
  }
}
