import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { catchError, from, map, Observable, of } from 'rxjs';
import { TileConfigurationDto } from 'shared/common/models';

import { MultilangDirective } from '../../directives';
import { AppSwitcherApp } from '../../models';
import { IconUrlPipe } from '../../pipes';
import { EnvironmentService, HubService } from '../../services';

export interface SelectedApp {
  id: number;
  type: 'app-switcher-app' | 'tile-config';
  data: AppSwitcherApp | TileConfigurationDto;
  name: string;
  icon: string | null;
  order: number;
  url: string;
  integratedView: boolean;
}

@Component({
  selector: 'lib-apps-nav-menu',
  templateUrl: './apps-nav-menu.component.html',
  styleUrls: ['./apps-nav-menu.component.scss'],
})
export class AppsNavMenuComponent implements OnInit {
  appSwitcherApps!: AppSwitcherApp[];

  tiles$ = this.hubService.tiles$.pipe(
    map(tiles =>
      [
        ...tiles.map(
          t =>
            ({
              id: t.id,
              type: 'tile-config',
              data: t,
              order: t.order,
              name: t.tileName,
              icon: t.iconUrl || null,
              url: t.appUrl,
              integratedView: t.integratedView,
            } as SelectedApp),
        ),
        ...(this.appSwitcherApps || []).map(
          a =>
            ({
              type: 'app-switcher-app',
              data: a,
              order: 0,
              name: MultilangDirective.translate(a.name, this.translateService),
              icon: a.icon || null,
              url: a.url,
            } as SelectedApp),
        ),
      ].sort((a, b) => a.order - b.order),
    ),
  );

  constructor(
    readonly environment: EnvironmentService,
    private readonly hubService: HubService,
    private readonly modal: NgbActiveModal,
    private readonly translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.hubService.initTiles().subscribe();
  }

  isActiveUrl(url: string) {
    if (url && this.environment.currentAppUrl) {
      return url.replace(/^\/+|\/+$/g, '') === this.environment.currentAppUrl;
    }
    return false;
  }

  getAppIcon(tile: SelectedApp) {
    if (tile.icon) {
      return {
        background: `url('${IconUrlPipe.do(tile.icon)}')`,
      };
    }

    return {
      background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' style='width:24px;height:24px' viewBox='0 0 24 24'%3E%3Cpath fill='%23aaaaaa' d='M21 2H3C1.9 2 1 2.9 1 4V20C1 21.1 1.9 22 3 22H21C22.1 22 23 21.1 23 20V4C23 2.9 22.1 2 21 2M21 7H3V4H21V7Z' /%3E%3C/svg%3E")`,
    };
  }

  onOpenApp(tile: SelectedApp, event: Event): boolean {
    if (event) {
      event.preventDefault();
    }
    this.modal.close(tile);
    return false;
  }

  static open(
    modalService: NgbModal,
    appSwitcherApps?: AppSwitcherApp[],
  ): Observable<SelectedApp | null> {
    const ref = modalService.open(AppsNavMenuComponent, {
      size: 'lg',
      container: 'header.navbar',
      // @ts-ignore
      animation: false,
      // @ts-ignore
      modalDialogClass: 'border-0',
    });
    (ref.componentInstance as AppsNavMenuComponent).appSwitcherApps = appSwitcherApps || [];

    return from(ref.result).pipe(
      catchError(_ => {
        return of(null);
      }),
      map(input => {
        return input ? (input as SelectedApp) : null;
      }),
    );
  }
}
