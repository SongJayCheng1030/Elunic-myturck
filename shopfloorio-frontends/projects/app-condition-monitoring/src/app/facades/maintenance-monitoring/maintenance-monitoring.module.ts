import { NgModule } from '@angular/core';
import { NgbAccordionModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { FacadeModule } from '..';
import { SharedModule } from '../shared.module';
import { MaintenanceMonitoringComponent } from './maintenance-monitoring.component';
import { MaintenanceMonitoringRoutingModule } from './maintenance-monitoring-routing.module';
import { LimitRulesModalComponent } from './mm-component-details/limit-rules-modal/limit-rules-modal.component';
import { MmComponentDetailsComponent } from './mm-component-details/mm-component-details.component';
import { MmEquipmentDetailsComponent } from './mm-equipment-details/mm-equipment-details.component';
import { MmEquipmentStatusComponent } from './mm-equipment-status/mm-equipment-status.component';
import { MmOverviewComponent } from './mm-overview/mm-overview.component';
import { MmPerformanceOverTimeComponent } from './mm-performance-over-time/mm-performance-over-time.component';
import { MmStatusComponent } from './mm-status/mm-status.component';

@NgModule({
  declarations: [
    MaintenanceMonitoringComponent,
    MmOverviewComponent,
    MmEquipmentStatusComponent,
    MmEquipmentDetailsComponent,
    MmComponentDetailsComponent,
    MmPerformanceOverTimeComponent,
    LimitRulesModalComponent,
    MmStatusComponent,
  ],
  imports: [MaintenanceMonitoringRoutingModule, SharedModule, NgbAccordionModule, NgbNavModule],
})
export class MaintenanceMonitoringModule implements FacadeModule {}
