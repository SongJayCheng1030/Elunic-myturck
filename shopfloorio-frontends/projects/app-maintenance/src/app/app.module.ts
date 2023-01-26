import { AgGridModule } from '@ag-grid-community/angular';
import { CDK_DRAG_CONFIG, DragDropModule } from '@angular/cdk/drag-drop';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SharedSessionService, SioCommonModule } from '@sio/common';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { GalleryModule } from 'ng-gallery';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CookieModule } from 'ngx-cookie';
import { IConfig, NgxMaskModule } from 'ngx-mask';
import { ToastrModule } from 'ngx-toastr';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaintenanceExecutionsArchiveTableComponent } from './components/maintenance-executions-archive-table/maintenance-executions-archive-table.component';
import { MntProgressIndicatorComponent } from './components/maintenance-executions-table/components/progress-indicator/progress-indicator.component';
import { MaintenanceExecutionsTableComponent } from './components/maintenance-executions-table/maintenance-executions-table.component';
import { MntCheckboxContentStepFormComponent } from './components/maintenance-procedure-form/components/checkbox-step-content-form/checkbox-step-content-form.component';
import { MntMaintenanceProcedureGeneralInfoFormComponent } from './components/maintenance-procedure-form/components/maintenance-procedure-general-info-form/maintenance-procedure-general-info-form.component';
import { MntMaintenanceProcedureStepFormComponent } from './components/maintenance-procedure-form/components/maintenance-procedure-step-form/maintenance-procedure-step-form.component';
import { MntMaintenanceMachineVariableStepFormComponent } from './components/maintenance-procedure-form/components/maintenance-machine-variable-step-form/maintenance-machine-variable-step-form.component';
import { MntNumericContentStepFormComponent } from './components/maintenance-procedure-form/components/numeric-step-content-form/numeric-step-content-form.component';
import { MntProcedureStepDocumentsFormComponent } from './components/maintenance-procedure-form/components/procedure-step-document-form/procedure-step-document-form.component';
import { MntProcedureStepFromLibrarySelectComponent } from './components/maintenance-procedure-form/components/procedure-step-from-library-select/procedure-step-from-library-select.component';
import { MntProcedureStepImagesFormComponent } from './components/maintenance-procedure-form/components/procedure-step-images-form/procedure-step-images-form.component';
import { MntTextContentStepFormComponent } from './components/maintenance-procedure-form/components/text-step-content-form/text-step-content-form.component';
import { MntMaintenanceProcedureFormComponent } from './components/maintenance-procedure-form/maintenance-procedure-form.component';
import { MaintenanceProceduresTableComponent } from './components/maintenance-procedures-table/maintenance-procedures-table.component';
import { MaintenanceStepLibraryFormComponent } from './components/maintenance-step-library-form/maintenance-step-library-form.component';
import { MaintenanceStepLibraryTableComponent } from './components/maintenance-step-library-table/maintenance-step-library-table.component';
import { NavTabsComponent } from './components/nav-tabs/nav-tabs.component';
import { SharedModule } from './shared.module';
import { MntGridDateCellRendererComponent } from './shared/components/grid-date-cell-renderer/grid-date-cell-renderer.component';
import {
  MntGridDateRangeFloatingFilter,
  MntGridDateRangeFloatingFilterComponent,
} from './shared/components/grid-date-range-floating-filter/grid-date-range-floating-filter.component';
import { AutofocusDirective } from './shared/directives/auto-focus.directive';
import { StepTypeNamePipe } from './shared/pipes/step-type-name.pipe';
import { MaintenanceExecutionDetailComponent } from './views/maintenance-execution-detail/maintenance-execution-detail.component';
import { MaintenanceExecutionsArchiveComponent } from './views/maintenance-executions-archive/maintenance-executions-archive.component';
import { MaintenanceExecutionsComponent } from './views/maintenance-executions/maintenance-executions.component';
import { MntMaintenanceLibraryStepDetailsComponent } from './views/maintenance-library-step-details/maintenance-library-step-details.component';
import { MaintenanceProcedureCreateComponent } from './views/maintenance-procedure-create/maintenance-procedure-create.component';
import { MaintenanceProcedureEditComponent } from './views/maintenance-procedure-edit/maintenance-procedure-edit.component';
import { MaintenanceProcedureStepLibraryComponent } from './views/maintenance-procedure-step-library/maintenance-procedure-step-library.component';
import { MaintenanceProceduresComponent } from './views/maintenance-procedures/maintenance-procedures.component';
import { MaintenanceStepDetailComponent } from './views/maintenance-step-detail/maintenance-step-detail.component';
import { MaintenanceStepLibraryCreateComponent } from './views/maintenance-step-library-create/maintenance-step-library-create.component';
import { MntMaintenanceLibraryStepEditComponent } from './views/maintenance-step-library-edit/maintenance-step-library-edit.component';
import { MaintenanceTabsComponent } from './views/maintenance-tabs/maintenance-tabs.component';
import { ModalAssignMaintenancePlanComponent } from './views/modal-assign-maintenance-plan/modal-assign-maintenance-plan.component';

registerLocaleData(localeDe, localeDeExtra);

const DragConfig = {
  dragStartThreshold: 0,
  pointerDirectionChangeThreshold: 5,
  zIndex: 10000,
};

const NGX_MASK_CONFIG: Partial<IConfig> = {
  validation: false,
};

@NgModule({
  declarations: [
    AppComponent,
    MaintenanceExecutionDetailComponent,
    MaintenanceExecutionsArchiveComponent,
    MaintenanceProcedureStepLibraryComponent,
    MaintenanceExecutionsComponent,
    MaintenanceProcedureCreateComponent,
    MaintenanceProcedureEditComponent,
    MaintenanceProceduresComponent,
    MaintenanceTabsComponent,
    MaintenanceExecutionsArchiveTableComponent,
    MaintenanceExecutionsTableComponent,
    MaintenanceProceduresTableComponent,
    MntProcedureStepDocumentsFormComponent,
    MntProcedureStepImagesFormComponent,
    MntMaintenanceProcedureFormComponent,
    MntMaintenanceProcedureGeneralInfoFormComponent,
    MntMaintenanceProcedureStepFormComponent,
    MntMaintenanceMachineVariableStepFormComponent,
    MntGridDateCellRendererComponent,
    MntGridDateRangeFloatingFilter,
    MntGridDateRangeFloatingFilterComponent,
    MntProgressIndicatorComponent,
    MntCheckboxContentStepFormComponent,
    MntNumericContentStepFormComponent,
    MntTextContentStepFormComponent,
    NavTabsComponent,
    StepTypeNamePipe,
    MaintenanceStepLibraryFormComponent,
    MaintenanceStepLibraryTableComponent,
    MaintenanceStepLibraryCreateComponent,
    MntMaintenanceLibraryStepDetailsComponent,
    ModalAssignMaintenancePlanComponent,
    MntProcedureStepFromLibrarySelectComponent,
    MaintenanceStepDetailComponent,
    MntMaintenanceLibraryStepEditComponent,
    AutofocusDirective,
  ],
  imports: [
    AgGridModule,
    BrowserModule,
    NgbModule,
    CommonModule,
    GalleryModule,
    SharedModule,
    DragDropModule,
    PdfViewerModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    NgSelectModule,
    CommonModule,
    CdkTreeModule,
    CookieModule.forRoot(),
    NgxMaskModule.forRoot(NGX_MASK_CONFIG),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    SioCommonModule,
    EditorModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    environment.production ? [] : AkitaNgDevtools.forRoot(),
  ],
  exports: [],
  providers: [
    { provide: LOCALE_ID, useValue: 'de' },
    { provide: CDK_DRAG_CONFIG, useValue: DragConfig },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [SharedSessionService],
      multi: true,
    },
    {
      provide: TINYMCE_SCRIPT_SRC,
      useValue: 'tinymce/tinymce.min.js',
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

function HttpLoaderFactory(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: './assets/i18n/', suffix: '.json' },
    { prefix: './sio-common/assets/i18n/', suffix: '.json' },
  ]);
}

function initializeApp(service: SharedSessionService) {
  return async () => {
    await service.initializeService();
  };
}
