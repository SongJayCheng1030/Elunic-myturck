import { Component, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppSwitcherApp, FRONTEND_LANGUAGE_PRELOAD_ORDER } from '@sio/common';

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  appName = 'Condition Monitoring';
  appSwitcherApps!: AppSwitcherApp[];
  settingsItems = [{ appUrl: '/config-management', tileName: 'VIEWS.CONFIG_MANAGEMENT.TITLE' }];

  constructor(
    private readonly translate: TranslateService,
    private readonly appService: AppService,
    private readonly router: Router,
  ) {
    this.translate.setDefaultLang(FRONTEND_LANGUAGE_PRELOAD_ORDER.slice(-1)[0]);
  }

  ngOnInit(): void {
    this.appSwitcherApps = this.appService.appSwitcherApps;
    this.router.events.subscribe(e => {
      if (!(e instanceof ActivationEnd)) return;
      if (e.snapshot.data && e.snapshot.data.name && e.snapshot.data.name.en_US) {
        this.appName = e.snapshot.data.name.en_US;
        document.title = `shopfloor.io ${e.snapshot.data.name.en_US}`;
      } else {
        this.appName = 'Condition Monitoring';
        document.title = 'shopfloor.io Condition Monitoring';
      }
    });
  }
}
