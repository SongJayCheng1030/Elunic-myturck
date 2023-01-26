import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

interface ModalMessageContent {
  title: string;
  body: string;
  dismiss: string;
}

@Component({
  selector: 'lib-modal-message',
  templateUrl: './modal-message.component.html',
  styleUrls: ['./modal-message.component.scss'],
})
export class ModalMessageComponent {
  content!: ModalMessageContent;
  type: 'danger' | 'warning' | 'success' = 'danger';

  constructor(private modal: NgbActiveModal) {}

  close(): void {
    this.modal.close();
  }
}
