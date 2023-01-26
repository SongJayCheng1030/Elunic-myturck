import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TenantDetailComponent } from './tenant-detail/tenant-detail.component';
import { TenantListComponent } from './tenant-list/tenant-list.component';

const routes: Routes = [
  { path: '', component: TenantListComponent },
  { path: ':tenantId', component: TenantDetailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
