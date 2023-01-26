import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SettingsItem, TileConfigurationDto } from 'shared/common/models';
import urlJoin from 'url-join';

import { ModalScannerComponent } from '../../modals';
import { AppSwitcherApp } from '../../models';
import { EnvironmentService, GeneralConfigurationService } from '../../services';
import { LocalSessionStorageService } from '../../services/local-session-storage.service';
import { SharedSessionService } from '../../services/shared-session.service';
import { Logger } from '../../util/logger';
import { AppsNavMenuComponent } from '../apps-nav-menu/apps-nav-menu.component';

@Component({
  selector: 'lib-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  private logger = new Logger('HeaderComponent');

  @Input()
  appName!: string;

  @Input()
  showStatus = false;

  @Input()
  appSwitcherApps!: AppSwitcherApp[];

  @Input()
  settingsItems!: SettingsItem[];

  @Input()
  allowDefaults = true;

  @Input()
  scanner = true;

  @Output()
  action = new EventEmitter<any>();

  defaultSettingsItems: SettingsItem[] = [
    {
      appUrl: this.environment.tenantsFrontendUrl,
      tileName: 'SETTINGS_ITEMS.TENANTS',
    },
    {
      appUrl: this.environment.usersFrontendUrl,
      tileName: 'SETTINGS_ITEMS.USERS',
    },
    {
      appUrl: this.environment.assetsManagerFrontendUrl,
      tileName: 'SETTINGS_ITEMS.ASSETS',
    },
  ];
  hubFrontendUrl = this.environment.hubFrontendUrl || new URL('/hub/', window.location.origin).href;
  logoImage = '';

  get isInTenant() {
    // TODO: fixme
    return true; // this.userInfo?.isMultitenant && this.userInfo?.tenantId;
  }

  get userDisplayName(): string {
    return this.sharedSessionService.userName;
  }

  private userImageUrl: string = this.sharedSessionService.getUserImageUrl();

  constructor(
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly modalService: NgbModal,
    private readonly localStorageService: LocalSessionStorageService,
    private readonly sharedSessionService: SharedSessionService,
    private readonly environment: EnvironmentService,
    private generalConfigurationService: GeneralConfigurationService,
  ) {
    this.logger.debug(`Loading header component ...`);

    this.sharedSessionService
      .getMyImageUrl()
      .then(url => {
        this.logger.debug(`getMyImageUrl:`, url);
        this.userImageUrl = url;
      })
      .catch(_ => {
        this.userImageUrl = this.sharedSessionService.getUserImageUrl();
      });
  }

  ngOnInit(): void {
    const storedLang = this.localStorageService.getString('sf_language', 'en_EN');
    if (storedLang) {
      this.translate.use(storedLang);
    }
    this.generalConfigurationService.getHttpGeneralConfiguration().then(() => {
      const logoImage = this.generalConfigurationService.getProperty('logoImage');
      if (logoImage) {
        this.logoImage = (logoImage.value as string) || 'assets/images/logo.png';
      }
    });
  }

  get userImgUrl(): string {
    return this.userImageUrl;
  }

  getUserProfileLink(): string {
    // TODO: FIXME: Not yet implemented
    return '';
  }

  onHandleTileLink(app: TileConfigurationDto) {
    let url = '/';
    try {
      url = new URL(app.appUrl).href;
    } catch {
      url = new URL(
        !app.appUrl.startsWith('/') ? `/${app.appUrl}` : app.appUrl,
        window.location.origin,
      ).href;
    }
    this.onHandleLink({
      name: app.tileName,
      url,
      icon: app.iconUrl,
    });
  }

  onHandleLink(app: AppSwitcherApp) {
    let url = '';
    if (typeof app.url === 'string') {
      url = app.url as string;
    } else if (app.url instanceof URL) {
      url = (app.url as URL).href;
    } else if (Array.isArray(app.url) && app.url.length > 0) {
      this.router.navigate(app.url);
      return;
    }

    if (url) {
      if (url.startsWith('http')) {
        window.location.href = url;
      } else {
        this.router.navigate(url.split('/'));
      }
    }
  }

  onScanner() {
    this.modalService.open(ModalScannerComponent, { centered: true });
  }

  onLogout() {
    window.location.href = urlJoin(this.environment.userServiceUrl, '/v1/users/auth/sign_out');
  }

  onLeaveTenant() {
    window.location.href = urlJoin(this.environment.tenantsFrontendUrl);
  }

  onHandleSettingsClick(tile: SettingsItem) {
    if (tile.mode === 'emit') {
      this.action.emit(tile);
      return;
    }
    if (tile.appUrl.startsWith('http://') || tile.appUrl.startsWith('https://')) {
      window.location.href = tile.appUrl;
      return;
    }
    this.router.navigateByUrl(tile.appUrl as string);
  }

  toImageUrl(value: string) {
    if (value) {
      if (value.includes('http://') || value.includes('https://')) {
        return value;
      }

      return urlJoin(this.environment.fileServiceUrl, 'v1/file', value);
    }

    if (value && value.includes('noStubImg')) {
      return '';
    }

    return 'assets/images/no-image.png';
  }

  selectLanguage(langCode: string) {
    if (!langCode) {
      return;
    }
    this.translate.use(langCode);
    this.localStorageService.setString('sf_language', langCode);
  }

  onMenu() {
    AppsNavMenuComponent.open(this.modalService, this.appSwitcherApps).subscribe(sel => {
      this.logger.debug(`App switcher selected:`, sel);
      if (!sel) {
        return;
      }

      if (sel.integratedView) {
        window.location.href = urlJoin(
          this.environment.hubFrontendUrl,
          `#/integrated-tile-view/${sel.id}`,
        );
        return;
      }

      if (sel.type === 'tile-config') {
        this.onHandleTileLink(sel.data as TileConfigurationDto);
      } else {
        this.onHandleLink(sel.data as AppSwitcherApp);
      }
    });
  }
}
