import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '@sio/common';
import { from, map, Observable } from 'rxjs';

import { MntStepLibraryService } from '../../services';

@Component({
  selector: 'mnt-maintenance-step-library-form',
  templateUrl: './maintenance-step-library-form.component.html',
  styleUrls: ['./maintenance-step-library-form.component.scss'],
})
export class MaintenanceStepLibraryFormComponent implements OnInit {
  @Output() save = new EventEmitter();

  form!: FormGroup;
  availableTags$: Observable<string[]> = from(this.stepLibraryService.listStepTags()).pipe(
    map(tags => tags.map(tag => tag.name)),
  );

  constructor(
    private readonly stepLibraryService: MntStepLibraryService,
    private router: Router,
    private modalService: NgbModal,
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      step: new FormControl(null, Validators.required),
      saveToLibrary: new FormControl(false),
    });
  }

  async onCancel(): Promise<void> {
    const result = await this.openConfirmModal();
    if (result === 'confirm') {
      this.onSubmit();
    } else if (result === 'abort') {
      this.router.navigate(['/steps-library']);
    }
  }

  private openConfirmModal(): Promise<string> {
    const modal = this.modalService.open(ModalConfirmComponent, {
      centered: true,
      backdrop: 'static',
    });

    modal.componentInstance.content = {
      title: 'MODALS.LEAVE_WITHOUT_SAVING.TITLE',
      body: 'MODALS.LEAVE_WITHOUT_SAVING.BODY',
      confirm: 'MODALS.LEAVE_WITHOUT_SAVING.CONFIRM',
      abort: 'MODALS.LEAVE_WITHOUT_SAVING.ABORT',
      custom: {
        class: 'custom-modal',
        confirmButton: {
          class: 'btn-confirm',
          disabled: !this.form.valid,
        },
        abortButton: {
          class: 'btn-abort',
        },
      },
    };
    return modal.result;
  }

  onSubmit() {
    if (this.form.valid) {
      this.save.emit(this.form.getRawValue());
    }
  }

  get saveToLibrary() {
    return this.form.get('saveToLibrary');
  }
}
