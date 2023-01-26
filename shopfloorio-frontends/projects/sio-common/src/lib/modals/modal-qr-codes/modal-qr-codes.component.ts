import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { QrCode } from '../../models';

@Component({
  selector: 'app-modal-qr-codes',
  templateUrl: './modal-qr-codes.component.html',
  styleUrls: ['./modal-qr-codes.component.scss'],
})
export class ModalQrCodesComponent {
  title?: string;
  qrCodes: QrCode[] = [];
  qrWidth = 256;

  constructor(private readonly modal: NgbActiveModal) {}

  onCancel(): void {
    this.modal.close();
  }
}
