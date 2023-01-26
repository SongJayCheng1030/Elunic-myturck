import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SharedSessionService, SioCommonModule } from '@sio/common';
import { ToastrModule } from 'ngx-toastr';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { RoleDetailPageComponent } from './users-tabs-outlet/role-detail-page/role-detail-page.component';
import { RoleListComponent } from './users-tabs-outlet/role-list/role-list.component';
import { UserDetailPageComponent } from './users-tabs-outlet/user-detail-page/user-detail-page.component';
import { UserListComponent } from './users-tabs-outlet/user-list/user-list.component';
import { UsersTabsOutletComponent } from './users-tabs-outlet/users-tabs-outlet.component';

@NgModule({
  declarations: [
    AppComponent,
    UserListComponent,
    UsersTabsOutletComponent,
    UserDetailPageComponent,
    RoleListComponent,
    RoleDetailPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    BrowserAnimationsModule,
    SioCommonModule,
    NgSelectModule,
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
  return async () => {
    await service.initializeService();
  };
}
