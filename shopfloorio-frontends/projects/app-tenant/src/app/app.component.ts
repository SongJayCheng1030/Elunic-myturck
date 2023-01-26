import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FRONTEND_LANGUAGE_PRELOAD_ORDER } from '@sio/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    FRONTEND_LANGUAGE_PRELOAD_ORDER.forEach(lang => this.translate.setDefaultLang(lang));
  }
}
