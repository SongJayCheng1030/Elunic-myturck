import { NgModule } from '@angular/core';

import { ChartPanelComponent } from '../../components/chart-panel/chart-panel.component';
import { ChartPanelBodyDirective } from '../../components/chart-panel/chart-panel-body';
import {
  ChartPanelHeaderActionsDirective,
  ChartPanelHeaderDirective,
} from '../../components/chart-panel/chart-panel-header';
import { FacadeModule } from '..';
import { SharedModule } from '../shared.module';
import { EquipmentKpiComponent } from './equipment-kpi/equipment-kpi.component';
import { EquipmentKpiMultipleComponent } from './equipment-kpi-multiple/equipment-kpi-multiple.component';
import { EquipmentOeeComponent } from './equipment-oee/equipment-oee.component';
import { EquipmentStatusComponent } from './equipment-status/equipment-status.component';
import { EquipmentStatusHistoryComponent } from './equipment-status-history/equipment-status-history.component';
import { EquipmentThroughputComponent } from './equipment-throughput/equipment-throughput.component';
import { OeeDailyTrendComponent } from './oee-daily-trend/oee-daily-trend.component';
import { OeeMonitoringComponent } from './oee-monitoring.component';
import { OeeMonitoringDetailsComponent } from './oee-monitoring-details/oee-monitoring-details.component';
import { OeeMonitoringOverviewComponent } from './oee-monitoring-overview/oee-monitoring-overview.component';
import { OeeMonitoringRoutingModule } from './oee-monitoring-routing.module';
import { ThroughputDailyTrendComponent } from './throughput-daily-trend/throughput-daily-trend.component';

@NgModule({
  declarations: [
    OeeMonitoringComponent,
    EquipmentStatusComponent,
    EquipmentOeeComponent,
    EquipmentKpiComponent,
    EquipmentKpiMultipleComponent,
    EquipmentThroughputComponent,
    OeeDailyTrendComponent,
    EquipmentStatusHistoryComponent,
    ThroughputDailyTrendComponent,
    OeeMonitoringDetailsComponent,
    OeeMonitoringOverviewComponent,
    ChartPanelComponent,
    ChartPanelHeaderDirective,
    ChartPanelHeaderActionsDirective,
    ChartPanelBodyDirective,
  ],
  imports: [SharedModule, OeeMonitoringRoutingModule],
})
export class OeeMonitoringModule implements FacadeModule {}
