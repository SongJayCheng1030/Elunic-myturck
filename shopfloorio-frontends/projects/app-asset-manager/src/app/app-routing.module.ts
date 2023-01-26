import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetDetailsComponent } from './views/asset-details/asset-details.component';
import { AssetDetailsResolver } from './views/asset-details/asset-details.resolver';
import { AssetImageMapDetailsComponent } from './views/asset-image-map-details/asset-image-map-details.component';
import { AssetImageMapDetailsResolver } from './views/asset-image-map-details/asset-image-map-details.resolver';
import { AllocatedAssetsComponent } from './views/asset-tabs-outlet/allocated-assets/allocated-assets.component';
import { AssetMapsComponent } from './views/asset-tabs-outlet/asset-maps/asset-maps.component';
import { AssetPoolComponent } from './views/asset-tabs-outlet/asset-pool/asset-pool.component';
import { AssetTabsOutletComponent } from './views/asset-tabs-outlet/asset-tabs-outlet.component';
import { AssetTypesComponent } from './views/asset-tabs-outlet/asset-types/asset-types.component';
import { AssetDeviceManagementComponent } from './views/asset-tabs-outlet/device-management/device-management.component';
import { MachineVariablesComponent } from './views/asset-tabs-outlet/machine-variables/machine-variables.component';
import { AssetTypeDetailsComponent } from './views/asset-type-details/asset-type-details.component';
import { AssetTypeDetailsResolver } from './views/asset-type-details/asset-type-details.resolver';
import { DeviceDetailsComponent } from './views/device-details/device-details.component';
import { DeviceDetailsResolver } from './views/device-details/device-details.resolver';

const routes: Routes = [
  {
    path: '',
    component: AssetTabsOutletComponent,
    children: [
      { path: '', redirectTo: 'allocated-assets', pathMatch: 'full' },
      { path: 'allocated-assets', component: AllocatedAssetsComponent },
      { path: 'asset-pool', component: AssetPoolComponent },
      { path: 'asset-types', component: AssetTypesComponent },
      { path: 'asset-maps', component: AssetMapsComponent },
      { path: 'device-management', component: AssetDeviceManagementComponent },
      { path: 'machine-variables', component: MachineVariablesComponent },
    ],
  },
  {
    path: 'assets/new',
    component: AssetDetailsComponent,
  },
  {
    path: 'assets/:id',
    component: AssetDetailsComponent,
    resolve: { asset: AssetDetailsResolver },
  },
  {
    path: 'asset-types/new',
    component: AssetTypeDetailsComponent,
  },
  {
    path: 'asset-types/:id',
    component: AssetTypeDetailsComponent,
    resolve: { assetType: AssetTypeDetailsResolver },
  },
  {
    path: 'asset-maps/new',
    component: AssetImageMapDetailsComponent,
  },
  {
    path: 'asset-maps/:id',
    component: AssetImageMapDetailsComponent,
    resolve: { assetImageMap: AssetImageMapDetailsResolver },
  },
  {
    path: 'devices/:id',
    component: DeviceDetailsComponent,
    resolve: { device: DeviceDetailsResolver },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
