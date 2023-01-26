import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';

export interface AgGridGridDropdownAction {
  name: string;
  callback: AgGridActionCallback;
}

interface AgGridActionCallback {
  (id: string): void;
}

interface AgGridActionDropdownData extends ICellRendererParams {
  actions: AgGridGridDropdownAction[];
}

@Component({
  selector: 'ag-grid-action-dropdown',
  templateUrl: './ag-grid-action-dropdown.component.html',
  styleUrls: ['./ag-grid-action-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgGridActionDropdownComponent implements ICellRendererAngularComp {
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  private executionId!: string;
  actions!: AgGridGridDropdownAction[];

  constructor() {}

  agInit(data: AgGridActionDropdownData): void {
    this.updateData(data);
  }

  refresh(data: AgGridActionDropdownData): boolean {
    this.updateData(data);
    return true;
  }

  onActionSelection(callback: AgGridActionCallback) {
    callback(this.executionId);
  }

  private updateData(data: AgGridActionDropdownData) {
    this.executionId = data.data.id;
    this.actions = data.actions;
  }
}
