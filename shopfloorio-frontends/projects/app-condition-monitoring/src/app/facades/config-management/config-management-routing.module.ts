import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConfigManagementComponent } from './config-management.component';

const routes: Routes = [{ path: '', component: ConfigManagementComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfigManagementRoutingModule {}
