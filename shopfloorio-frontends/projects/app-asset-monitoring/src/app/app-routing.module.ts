import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MonitoringComponent } from './views/monitoring/monitoring.component';
import { AssetOverviewComponent } from './views/monitoring/asset-overview/asset-overview.component';
import { AssetOverviewResolver } from './views/monitoring/asset-overview/asset-overview.resolver';
import { MonitoringResolver } from './views/monitoring/monitoring.resolver';

const routes: Routes = [
  {
    path: '',
    component: MonitoringComponent,
    resolve: { assetTree: MonitoringResolver },
    children: [
      { path: 'overview', component: AssetOverviewComponent },
      {
        path: 'overview/:id',
        component: AssetOverviewComponent,
        resolve: { asset: AssetOverviewResolver },
      },
      { path: '**', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
