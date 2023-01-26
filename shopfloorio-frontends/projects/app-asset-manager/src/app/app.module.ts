import { AgGridModule } from '@ag-grid-community/angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutModule } from '@angular/cdk/layout';
import { CdkTreeModule } from '@angular/cdk/tree';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SharedSessionService, SioCommonModule } from '@sio/common';
import { ToastrModule } from 'ngx-toastr';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddAliasModalComponent } from './views/asset-details/asset-aliases/add-alias-modal/add-alias-modal.component';
import { AssetAliasesComponent } from './views/asset-details/asset-aliases/asset-aliases.component';
import { AssetDetailsFormComponent } from './views/asset-details/asset-details-form/asset-details-form.component';
import { AssetDetailsComponent } from './views/asset-details/asset-details.component';
import { AssetDocumentsComponent } from './views/asset-details/asset-documents/asset-documents.component';
import { DocumentModalComponent } from './views/asset-details/asset-documents/document-modal/document-modal.component';
import { AssetDynamicPropertiesComponent } from './views/asset-details/asset-dynamic-properties/asset-dynamic-properties.component';
import { AssetHistoryComponent } from './views/asset-details/asset-history/asset-history.component';
import { AssetImageMapDetailsComponent } from './views/asset-image-map-details/asset-image-map-details.component';
import { AllocatedAssetsComponent } from './views/asset-tabs-outlet/allocated-assets/allocated-assets.component';
import { AssetPoolModalComponent } from './views/asset-tabs-outlet/allocated-assets/asset-pool-modal/asset-pool-modal.component';
import { AssetHierarchyDropdownComponent } from './views/asset-tabs-outlet/asset-hierarchy-dropdown/asset-hierarchy-dropdown.component';
import { AssetMapsComponent } from './views/asset-tabs-outlet/asset-maps/asset-maps.component';
import { AssetPoolComponent } from './views/asset-tabs-outlet/asset-pool/asset-pool.component';
import { AssetTabsOutletComponent } from './views/asset-tabs-outlet/asset-tabs-outlet.component';
import { AssetTypesComponent } from './views/asset-tabs-outlet/asset-types/asset-types.component';
import { AssetDeviceManagementComponent } from './views/asset-tabs-outlet/device-management/device-management.component';
import { MachineVariablesComponent } from './views/asset-tabs-outlet/machine-variables/machine-variables.component';
import { AssetTypeAssignedAssetsComponent } from './views/asset-type-details/asset-type-assigned-assets/asset-type-assigned-assets.component';
import { AssetTypeDetailsFormComponent } from './views/asset-type-details/asset-type-details-form/asset-type-details-form.component';
import { AssetTypeDetailsComponent } from './views/asset-type-details/asset-type-details.component';
import { AssetTypePropertiesComponent } from './views/asset-type-details/asset-type-properties/asset-type-properties.component';
import { PropertyModalComponent } from './views/asset-type-details/asset-type-properties/property-modal/property-modal.component';
import { DeviceManagementAssignComponent } from './views/device-assign/device-assign.component';
import { DeviceManagementCreateComponent } from './views/device-create/device-create.component';
import { DeviceDetailsComponent } from './views/device-details/device-details.component';
import { MachineVariableCreateComponent } from './views/machine-variable-create/machine-variable-create.component';
import { MachineVariableEditComponent } from './views/machine-variable-edit/machine-variable-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    AllocatedAssetsComponent,
    AssetTabsOutletComponent,
    AssetPoolComponent,
    AssetTypesComponent,
    AssetHierarchyDropdownComponent,
    AssetDetailsComponent,
    AssetDetailsFormComponent,
    AssetDocumentsComponent,
    AssetHistoryComponent,
    AssetAliasesComponent,
    AddAliasModalComponent,
    DocumentModalComponent,
    AssetPoolModalComponent,
    AssetTypeDetailsComponent,
    AssetTypeDetailsFormComponent,
    AssetTypePropertiesComponent,
    PropertyModalComponent,
    AssetTypeAssignedAssetsComponent,
    AssetDynamicPropertiesComponent,
    AssetMapsComponent,
    MachineVariablesComponent,
    AssetImageMapDetailsComponent,
    AssetDeviceManagementComponent,
    DeviceManagementCreateComponent,
    DeviceManagementAssignComponent,
    DeviceDetailsComponent,
    MachineVariableCreateComponent,
    MachineVariableEditComponent,
  ],
  imports: [
    AgGridModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    SioCommonModule,
    DragDropModule,
    ToastrModule.forRoot(),
    NgSelectModule,
    BrowserAnimationsModule,
    CdkTreeModule,
    NgbModule,
    LayoutModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    environment.production ? [] : AkitaNgDevtools.forRoot(),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [SharedSessionService],
      multi: true,
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
  return async () => service.initializeService();
}
