import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BarcodeFormat } from '@zxing/library';
import { find } from 'lodash';
import { AssetDto } from 'shared/common/models';
import urlJoin from 'url-join';

import { AssetService, EnvironmentService } from '../../services';

@Component({
  selector: 'app-modal-scanner',
  templateUrl: './modal-scanner.component.html',
  styleUrls: ['./modal-scanner.component.scss'],
})
export class ModalScannerComponent {
  title = 'SCANNER.QR_CODE_SCAN';
  allowedFormats = [BarcodeFormat.QR_CODE];
  loading = false;
  warningMessage = '';

  constructor(
    private readonly modal: NgbActiveModal,
    private readonly assetService: AssetService,
    private readonly environment: EnvironmentService,
  ) {}

  onCancel(): void {
    this.modal.close();
  }

  async onScanSuccess(data: string) {
    if (!this.loading && data) {
      this.loading = true;
      try {
        const assets = await this.assetService.getAssetByAlias(data);
        if (assets?.length) {
          const asset = find(assets, { aliases: [{ alias: data }] }) as AssetDto;
          if (asset) {
            window.location.href = urlJoin(
              this.environment.assetsManagerFrontendUrl,
              `/#/assets/${asset.id}`,
            );
          }
        }
      } catch (error) {}
      this.loading = false;
    }
  }

  onCamerasNotFound() {
    this.warningMessage = 'SCANNER.CAMERA_NOT_FOUND';
  }

  onPermissionResponse(permission: boolean) {
    if (!permission) {
      this.warningMessage = 'SCANNER.CAMERA_BLOCKED';
    }
  }
}
