import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

interface BtnAttributes {
  class?: string;
  disabled?: boolean;
}

interface ModalConfirmContent {
  title: string;
  body: string;
  confirm: string;
  abort: string;
  custom?: { class: string; confirmButton: BtnAttributes; abortButton: BtnAttributes };
}

@Component({
  selector: 'lib-modal-confirm',
  templateUrl: './modal-confirm.component.html',
  styleUrls: ['./modal-confirm.component.scss'],
})
export class ModalConfirmComponent {
  content!: ModalConfirmContent;

  constructor(private modal: NgbActiveModal) {}

  onAction(action: string): void {
    if (this.content.custom) {
      this.modal.close(action);
    } else {
      this.modal.close(action === 'confirm' ? true : false);
    }
  }
}
