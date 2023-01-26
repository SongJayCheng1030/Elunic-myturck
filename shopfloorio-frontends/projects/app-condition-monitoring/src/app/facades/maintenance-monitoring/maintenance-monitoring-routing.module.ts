import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MaintenanceMonitoringComponent } from './maintenance-monitoring.component';
import { MmComponentDetailsComponent } from './mm-component-details/mm-component-details.component';
import { MmComponentDetailsResolver } from './mm-component-details/mm-component-details.resolver';
import { MmEquipmentDetailsComponent } from './mm-equipment-details/mm-equipment-details.component';
import { MmOverviewComponent } from './mm-overview/mm-overview.component';

const routes: Routes = [
  {
    path: '',
    component: MaintenanceMonitoringComponent,
    children: [
      { path: 'overview', component: MmOverviewComponent },
      { path: 'overview/:id', component: MmOverviewComponent },
      { path: 'details/:id', component: MmEquipmentDetailsComponent },
      {
        path: 'details/:id/:componentId',
        resolve: { component: MmComponentDetailsResolver },
        component: MmComponentDetailsComponent,
      },
      { path: '**', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaintenanceMonitoringRoutingModule {}
