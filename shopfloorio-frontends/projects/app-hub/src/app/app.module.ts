import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SharedHubService, SharedSessionService, SioCommonModule } from '@sio/common';
import { CookieModule } from 'ngx-cookie';
import { ToastrModule } from 'ngx-toastr';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    DashboardModule,
    NgbModule,
    CommonModule,
    CookieModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    SioCommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
  ],
  exports: [],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [SharedSessionService, SharedHubService],
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

function initializeApp(service: SharedSessionService, sharedHubService: SharedHubService) {
  return async () => {
    await service.initializeService();
    sharedHubService.initTiles().subscribe();
  };
}
