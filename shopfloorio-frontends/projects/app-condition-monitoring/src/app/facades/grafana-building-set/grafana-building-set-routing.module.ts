import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GrafanaBuildingSetComponent } from './grafana-building-set.component';
import { GrafanaSetAdminComponent } from './grafana-set-admin/grafana-set-admin.component';
import { GrafanaSetAssetComponent } from './grafana-set-asset/grafana-set-asset.component';

const routes: Routes = [
  {
    path: '',
    component: GrafanaBuildingSetComponent,
    children: [
      {
        path: 'asset/:assetId',
        component: GrafanaSetAssetComponent,
      },
      {
        path: 'admin',
        component: GrafanaSetAdminComponent,
      },
      { path: '**', redirectTo: 'asset/unknown', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GrafanaBuildingSetRoutingModule {}
