import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SharedSessionService, SioCommonModule } from '@sio/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ToastrModule } from 'ngx-toastr';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ModalLinkAssetsComponent } from './modals';
import { DocumentCategoryDetailComponent } from './views/document-category-detail/document-category-detail.component';
import { DocumentCategoryFormComponent } from './views/document-category-detail/document-category-form/document-category-form.component';
import { DocumentCategoryHistoryComponent } from './views/document-category-detail/document-category-history/document-category-history.component';
import { LinkedDocumentsComponent } from './views/document-category-detail/linked-documents/linked-documents.component';
import { DocumentDetailComponent } from './views/document-detail/document-detail.component';
import { DocumentDetailFormComponent } from './views/document-detail/document-detail-form/document-detail-form.component';
import { DocumentHistoryComponent } from './views/document-detail/document-history/document-history.component';
import { DocumentLinkedAssetsComponent } from './views/document-detail/document-linked-assets/document-linked-assets.component';
import { DocumentComponent } from './views/document-tabs-outlet/document/document.component';
import { DocumentCategoryComponent } from './views/document-tabs-outlet/document-category/document-category.component';
import { DocumentTabsOutletComponent } from './views/document-tabs-outlet/document-tabs-outlet.component';

@NgModule({
  declarations: [
    AppComponent,
    DocumentTabsOutletComponent,
    DocumentDetailComponent,
    DocumentDetailFormComponent,
    DocumentLinkedAssetsComponent,
    DocumentHistoryComponent,
    DocumentCategoryComponent,
    DocumentComponent,
    DocumentCategoryDetailComponent,
    DocumentCategoryHistoryComponent,
    LinkedDocumentsComponent,
    DocumentCategoryFormComponent,
    ModalLinkAssetsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    PdfViewerModule,
    TranslateModule.forRoot({
      defaultLanguage: 'de_DE',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    SioCommonModule,
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
  return async () => {
    await service.initializeService();
  };
}
