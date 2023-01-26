import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SharedSessionService, SioCommonModule } from '@sio/common';
import { ToastrModule } from 'ngx-toastr';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { NgSelectModule } from '@ng-select/ng-select';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TenantDetailComponent } from './tenant-detail/tenant-detail.component';
import { TenantListComponent } from './tenant-list/tenant-list.component';

@NgModule({
  declarations: [AppComponent, TenantListComponent, TenantDetailComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgbModule,
    NgSelectModule,
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
  return async () => service.initializeService();
}
