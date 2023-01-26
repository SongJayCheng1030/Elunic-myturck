import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { EnvironmentService, FRONTEND_LANGUAGE_PRELOAD_ORDER } from '@sio/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private readonly translate: TranslateService,
    private readonly environment: EnvironmentService,
  ) {
    this.translate.setDefaultLang(FRONTEND_LANGUAGE_PRELOAD_ORDER.slice(-1)[0]);
    this.environment.currentAppUrl = 'assets';
  }
}
