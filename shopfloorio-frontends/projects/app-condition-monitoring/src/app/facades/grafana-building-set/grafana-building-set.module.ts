import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FacadeModule } from '..';
import { SharedModule } from '../shared.module';
import { GrafanaBuildingSetAdminComponent } from './components/grafana-building-set-admin/grafana-building-set-admin.component';
import { GrafanaBuildingSetAssetTypeComponent } from './components/grafana-building-set-asset-type/grafana-building-set-asset-type.component';
import { GrafanaBuildingSetAssetComponent } from './components/grafana-building-set-asset/grafana-building-set-asset.component';
import { GrafanaBuildingSetRoutingModule } from './grafana-building-set-routing.module';
import { GrafanaBuildingSetComponent } from './grafana-building-set.component';
import { GrafanaAdminPanelComponent } from './grafana-admin-panel/grafana-admin-panel.component';
import { TileModalComponent } from './tile-modal/tile-modal.component';
import { GrafanaSetAdminComponent } from './grafana-set-admin/grafana-set-admin.component';
import { GrafanaSetAssetComponent } from './grafana-set-asset/grafana-set-asset.component';
import { GrafanaPanelComponent } from './grafana-panel/grafana-panel.component';

@NgModule({
  declarations: [
    GrafanaBuildingSetComponent,
    GrafanaBuildingSetAdminComponent,
    GrafanaBuildingSetAssetTypeComponent,
    TileModalComponent,
    GrafanaAdminPanelComponent,
    GrafanaBuildingSetAssetComponent,
    GrafanaSetAdminComponent,
    GrafanaSetAssetComponent,
    GrafanaPanelComponent,
  ],
  imports: [CommonModule, SharedModule, GrafanaBuildingSetRoutingModule],
})
export class GrafanaBuildingSetModule implements FacadeModule {}
