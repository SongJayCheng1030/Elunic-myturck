import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActiveAppFacade,
  AppSwitcherApp,
  EnvironmentService,
  Logger,
  SharedConditionMonitoringService,
} from '@sio/common';
import { lastValueFrom, map, Observable, zip } from 'rxjs';
import { DataResponse } from 'shared/common/response';

import { Facade, FACADE_LISTS, FACADE_SETTINGS, FacadeModule } from './facades';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private _logger = new Logger('AppService');

  private _activeAppFacades: ActiveAppFacade[] = [];

  constructor(
    private readonly httpClient: HttpClient,
    private readonly router: Router,
    @Inject(FACADE_LISTS)
    private readonly facades: Facade[],
    private readonly sharedCmService: SharedConditionMonitoringService,
    private readonly environment: EnvironmentService,
  ) {}

  private getMockFacades$(): Observable<ActiveAppFacade[]> {
    return this.httpClient
      .get<DataResponse<ActiveAppFacade[]>>('assets/mocks/sio-available-cm-apps.json')
      .pipe(map(resp => resp.data.map(f => ({ ...f, path: f.urlPath }))));
  }

  async init(): Promise<void> {
    this._logger.debug(`init()`);

    try {
      const [real, mocked] = await lastValueFrom(
        zip(this.sharedCmService.getFacades$(), this.getMockFacades$()),
      );

      this._logger.debug(`found facades: real=`, real, `mocked=`, mocked);

      // For mock purposes:
      // we combine the two sources: use the grafana buildoingset stuff
      // from the real backend and the other apps from the mock
      this._activeAppFacades = [
        ...real.filter(p => p.type === 'GRAFANA_BUILDING_SET'),
        ...mocked.filter(p => p.type !== 'GRAFANA_BUILDING_SET'),
      ];

      this._logger.debug(`_activeAppFacades=`, this._activeAppFacades);
      this.updateRouterConfig();
    } catch (e) {
      this._logger.error('Could not load App Facades!', e);
    }
  }

  get appSwitcherApps(): AppSwitcherApp[] {
    if (this.environment.isDevelopmentMode) {
      return this._activeAppFacades
        .map(app => {
          const exists = this.facades.find(p => p.type === app.type);

          if (!exists) {
            return null;
          }

          return {
            name: app.name,
            url: app.urlPath,
            icon: app.icon,
          };
        })
        .filter(p => !!p) as AppSwitcherApp[];
    } else {
      return [];
    }
  }

  private updateRouterConfig() {
    const lazyModules: any[] = [];
    FACADE_SETTINGS.forEach(p => lazyModules.push(this.toSettingsRoute(p)));
    this._activeAppFacades.forEach(app => {
      if (app) {
        const exists = this.facades.find(p => p.type === app.type);
        if (!exists) {
          this._logger.error(`Cannot find facade for:`, app);
        } else {
          lazyModules.push(this.toRoute(app, exists));
        }
      }
    });

    if (lazyModules.length) {
      this._logger.debug(`updating routes`, this.router.config, lazyModules);
      this.router.resetConfig([...this.router.config, ...lazyModules]);
    }
  }

  private toRoute(app: ActiveAppFacade, facade: Facade) {
    return {
      path: app.urlPath,
      data: {
        type: app.type,
        name: app.name,
        id: app.id,
        urlPath: app.urlPath,
      },
      loadChildren: () =>
        facade.importedModule.then((m: FacadeModule) => m[facade.moduleName as keyof FacadeModule]),
    };
  }

  private toSettingsRoute(facade: Facade) {
    return {
      path: facade.path,
      data: {
        name: facade.name,
      },
      loadChildren: () =>
        facade.importedModule.then((m: FacadeModule) => m[facade.moduleName as keyof FacadeModule]),
    };
  }
}
