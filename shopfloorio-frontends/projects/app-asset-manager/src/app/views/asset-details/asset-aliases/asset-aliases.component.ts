import { Component, EventEmitter, forwardRef, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalQrCodesComponent, QrCode } from '@sio/common';
import { AssetAliasDto } from 'shared/common/models';

import { AddAliasModalComponent } from './add-alias-modal/add-alias-modal.component';

const ASSET_ALIASES_CONTROL_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AssetAliasesComponent),
  multi: true,
};

@Component({
  selector: 'app-asset-aliases',
  templateUrl: './asset-aliases.component.html',
  styleUrls: ['./asset-aliases.component.scss'],
  providers: [ASSET_ALIASES_CONTROL_ACCESSOR],
})
export class AssetAliasesComponent implements ControlValueAccessor {
  private onTouch!: () => void;
  private onModalChange!: (aliases: AssetAliasDto[]) => void;

  disabled = false;
  aliases: AssetAliasDto[] = [];

  @Output() triggerEditing = new EventEmitter();

  constructor(private readonly modalService: NgbModal) {}

  async openAddAliasModal(): Promise<void> {
    const modal = this.modalService.open(AddAliasModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    const alias = await modal.result;

    if (alias) {
      this.onTouch();
      this.aliases = [...this.aliases, alias];
      this.onModalChange(this.aliases);
      this.triggerEditing.emit();
    }
  }

  writeValue(aliases: AssetAliasDto[]): void {
    this.aliases = aliases;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  registerOnChange(fn: (aliases: AssetAliasDto[]) => void): void {
    this.onModalChange = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  onAliasQrCode(dto: AssetAliasDto) {
    const modal = this.modalService.open(ModalQrCodesComponent, { centered: true });
    modal.componentInstance.title = 'MODALS.ASSET_QR_CODE.TITLE';
    (modal.componentInstance.qrCodes as QrCode[]) = [
      {
        name: dto.assetName,
        subTitle: dto.alias,
        data: dto.alias,
      },
    ];
  }
}
