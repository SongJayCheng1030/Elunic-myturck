import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import {
  AssetService,
  EnvironmentService,
  FRONTEND_LANGUAGE_PRELOAD_ORDER,
  ModalQrCodesComponent,
  QrCode,
} from '@sio/common';
import { AssetAliasType, SettingsItem } from 'shared/common/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private readonly translate: TranslateService,
    private readonly modalService: NgbModal,
    private readonly assetService: AssetService,
    private readonly environment: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.translate.addLangs(FRONTEND_LANGUAGE_PRELOAD_ORDER);
    FRONTEND_LANGUAGE_PRELOAD_ORDER.forEach((lang: string) => this.translate.setDefaultLang(lang));
    this.environment.currentAppUrl = 'asset-manager';
  }

  async onAction(item: SettingsItem) {
    if (item.appUrl === '/asset-qr-codes') {
      const assetAlias =
        (await this.assetService.getAssetAliasByType(AssetAliasType.QR_CODE)) || [];
      const modal = this.modalService.open(ModalQrCodesComponent, { centered: true, size: 'lg' });
      modal.componentInstance.title = 'SETTINGS_ITEMS.ASSET_QR_CODES';
      modal.componentInstance.qrWidth = 128;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (modal.componentInstance.qrCodes as QrCode[]) = assetAlias.map((entry: any) => ({
        name: entry.assetName,
        subTitle: entry.alias,
        data: entry.alias,
      }));
    }
  }
}
