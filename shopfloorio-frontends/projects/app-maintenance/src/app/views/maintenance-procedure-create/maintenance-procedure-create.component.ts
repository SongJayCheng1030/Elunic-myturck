import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '@sio/common';
import { CreateMaintenanceProcedureStepDto } from 'shared/common/models';

import { MntMaintenanceProcedureStepFormData } from '../../components/maintenance-procedure-form/maintenance-procedure-form.component';
import { MntProcedureService } from '../../services';

@Component({
  selector: 'mnt-maintenance-procedure-create',
  templateUrl: './maintenance-procedure-create.component.html',
  styleUrls: ['./maintenance-procedure-create.component.scss'],
})
export class MaintenanceProcedureCreateComponent {
  formControl = new FormControl();

  constructor(
    private router: Router,
    private procedureService: MntProcedureService,
    private modalService: NgbModal,
  ) {}

  async onCancel(): Promise<void> {
    const result = await this.openConfirmModal();
    if (result === 'confirm') {
      this.onSubmit();
    } else if (result === 'abort') {
      this.router.navigate(['/procedures']);
    }
  }

  async onSubmit() {
    if (this.formControl.valid) {
      const { generalInfo, steps } = this.formControl.value;
      await this.procedureService.createProcedure({
        ...generalInfo,
        steps: steps.map(stepFormData =>
          stepFormData.parentId ? stepFormData.parentId : this.transformStepFormData(stepFormData),
        ),
      });

      await this.router.navigate(['/procedures']);
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
          disabled: !this.formControl.valid,
        },
        abortButton: {
          class: 'btn-abort',
        },
      },
    };
    return modal.result;
  }

  private transformStepFormData({
    step: stepFormData,
  }: MntMaintenanceProcedureStepFormData): CreateMaintenanceProcedureStepDto {
    const { images, documents, machineVariable, ...step } = stepFormData;
    return {
      ...step,
      ...machineVariable,
      content: { ...step.content, images, documents },
    };
  }
}
