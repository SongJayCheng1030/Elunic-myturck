import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoleDetailPageComponent } from './users-tabs-outlet/role-detail-page/role-detail-page.component';
import { RoleListComponent } from './users-tabs-outlet/role-list/role-list.component';
import { UserDetailPageComponent } from './users-tabs-outlet/user-detail-page/user-detail-page.component';
import { UserListComponent } from './users-tabs-outlet/user-list/user-list.component';
import { UsersTabsOutletComponent } from './users-tabs-outlet/users-tabs-outlet.component';

const routes: Routes = [
  {
    path: '',
    component: UsersTabsOutletComponent,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UserListComponent },
      { path: 'roles', component: RoleListComponent },
    ],
  },
  {
    path: 'users/:id',
    component: UserDetailPageComponent,
  },
  {
    path: 'roles/:id',
    component: RoleDetailPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
