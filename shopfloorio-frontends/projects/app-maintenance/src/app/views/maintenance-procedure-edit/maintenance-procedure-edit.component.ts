import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '@sio/common';
import { omit } from 'lodash';
import {
  CreateMaintenanceProcedureStepDto,
  MaintenanceProcedureDto,
  MaintenanceProcedureStepDto,
} from 'shared/common/models';
import {
  MntMaintenanceProcedureFormData,
  MntMaintenanceProcedureStepFormData,
} from '../../components/maintenance-procedure-form/maintenance-procedure-form.component';
import { MntProcedureService } from '../../services';

@Component({
  selector: 'mnt-maintenance-procedure-edit',
  templateUrl: './maintenance-procedure-edit.component.html',
  styleUrls: ['./maintenance-procedure-edit.component.scss'],
})
export class MaintenanceProcedureEditComponent implements OnInit {
  formControl = new FormControl();

  procedure!: MaintenanceProcedureDto;

  private stepsChanged = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private procedureService: MntProcedureService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.procedure = this.activatedRoute.snapshot.data.procedure;

    this.formControl.setValue(this.transformProcedure(this.procedure));
  }

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
      await this.procedureService.updateProcedure(this.procedure.id, {
        name: generalInfo.name,
        description: generalInfo.description,
        interval: generalInfo.interval,
        intervalUnit: generalInfo.intervalUnit,
        ...(this.stepsChanged
          ? {
              steps: steps.map(stepFormData =>
                stepFormData.parentId
                  ? stepFormData.parentId
                  : this.transformStepFormData(stepFormData),
              ),
            }
          : {}),
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

  onStepsChanged(stepsChanged: boolean) {
    this.stepsChanged = stepsChanged;
  }

  private transformStepFormData({
    step: stepFormData,
  }: MntMaintenanceProcedureStepFormData): CreateMaintenanceProcedureStepDto {
    const { images, documents, machineVariable, ...step } = stepFormData;
    return {
      // sanitize data if step form didn't change the initial values are passed
      ...omit(step, 'id', 'createdAt', 'updatedAt', 'position', 'key'),
      ...machineVariable,
      content: { ...step.content, images, documents },
    };
  }

  private transformProcedure(procedure: MaintenanceProcedureDto): MntMaintenanceProcedureFormData {
    const { steps, ...rest } = procedure;
    return {
      generalInfo: rest,
      steps: steps.map(step => this.transformStep(step)),
    };
  }

  private transformStep(step: MaintenanceProcedureStepDto): MntMaintenanceProcedureStepFormData {
    const { machineVariableId, rangeFrom, rangeTo } = step;
    const { images, ...restContent } = step.content;
    return {
      step: {
        ...omit(step, 'machineVariableId', 'rangeFrom', 'rangeTo'),
        images,
        content: restContent,
        documents: [],
        machineVariable: {
          machineVariableId,
          rangeFrom,
          rangeTo,
        },
      },
      saveToLibrary: false,
      parentId: step.parentId,
    };
  }
}
