import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SharedSessionService, SioCommonModule } from '@sio/common';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { AppRoutingModule } from './app-routing.module';
import { FACADE_LISTS, FACADES } from './facades';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    SioCommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    {
      provide: FACADE_LISTS,
      useValue: FACADES,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppService, SharedSessionService],
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

function initializeApp(appService: AppService, service: SharedSessionService) {
  return async () => {
    await appService.init();
    await service.initializeService();
  };
}
