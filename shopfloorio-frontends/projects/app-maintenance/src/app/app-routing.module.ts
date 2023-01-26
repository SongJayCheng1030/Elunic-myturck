import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExecutionResolver } from './resolvers/execution.resolver';
import { MntLibraryStepResolver } from './resolvers/library-step.resolver';
import { ProcedureResolver } from './resolvers/procedure.resolver';
import { MaintenanceExecutionDetailComponent } from './views/maintenance-execution-detail/maintenance-execution-detail.component';
import { MaintenanceExecutionsArchiveComponent } from './views/maintenance-executions-archive/maintenance-executions-archive.component';
import { MaintenanceExecutionsComponent } from './views/maintenance-executions/maintenance-executions.component';
import { MntMaintenanceLibraryStepDetailsComponent } from './views/maintenance-library-step-details/maintenance-library-step-details.component';
import { MaintenanceProcedureCreateComponent } from './views/maintenance-procedure-create/maintenance-procedure-create.component';
import { MaintenanceProcedureEditComponent } from './views/maintenance-procedure-edit/maintenance-procedure-edit.component';
import { MaintenanceProcedureStepLibraryComponent } from './views/maintenance-procedure-step-library/maintenance-procedure-step-library.component';
import { MaintenanceProceduresComponent } from './views/maintenance-procedures/maintenance-procedures.component';
import { MaintenanceStepLibraryCreateComponent } from './views/maintenance-step-library-create/maintenance-step-library-create.component';
import { MntMaintenanceLibraryStepEditComponent } from './views/maintenance-step-library-edit/maintenance-step-library-edit.component';
import { MaintenanceTabsComponent } from './views/maintenance-tabs/maintenance-tabs.component';

const routes: Routes = [
  { path: '', redirectTo: '/executions', pathMatch: 'full' },
  {
    path: '',
    component: MaintenanceTabsComponent,
    children: [
      {
        path: 'executions',
        component: MaintenanceExecutionsComponent,
      },
      {
        path: 'executions/:id',
        component: MaintenanceExecutionDetailComponent,
        resolve: { execution: ExecutionResolver },
        data: { tabsHidden: true },
      },
      {
        path: 'procedures',
        component: MaintenanceProceduresComponent,
        data: { tabsHidden: true },
      },
      {
        path: 'procedures/new',
        component: MaintenanceProcedureCreateComponent,
        data: { tabsHidden: true },
      },
      {
        path: 'procedures/:id/edit',
        component: MaintenanceProcedureEditComponent,
        resolve: { procedure: ProcedureResolver },
        data: { tabsHidden: true },
      },
      {
        path: 'archive',
        component: MaintenanceExecutionsArchiveComponent,
      },
      {
        path: 'steps-library',
        component: MaintenanceProcedureStepLibraryComponent,
        data: { tabsHidden: true },
      },
      {
        path: 'steps-library/new',
        component: MaintenanceStepLibraryCreateComponent,
        data: { tabsHidden: true },
      },
      {
        path: 'steps-library/:id/edit',
        component: MntMaintenanceLibraryStepEditComponent,
        resolve: [MntLibraryStepResolver],
        data: { tabsHidden: true },
      },
      {
        path: 'steps-library/:id',
        component: MntMaintenanceLibraryStepDetailsComponent,
        resolve: [MntLibraryStepResolver],
        data: { tabsHidden: true },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
