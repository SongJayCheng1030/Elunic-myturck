import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OeeMonitoringComponent } from './oee-monitoring.component';

const routes: Routes = [
  {
    path: '',
    component: OeeMonitoringComponent,
    children: [
      { path: ':id', component: OeeMonitoringComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OeeMonitoringRoutingModule {}
