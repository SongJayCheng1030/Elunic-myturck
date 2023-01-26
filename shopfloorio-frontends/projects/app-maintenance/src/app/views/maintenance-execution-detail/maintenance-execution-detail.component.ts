import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService, FileService } from '@sio/common';
import * as moment from 'moment';
import { from, map, Observable, Subject, takeUntil } from 'rxjs';
import {
  AssetDto,
  MaintenanceExecutionDto,
  MaintenanceExecutionStepResultDto,
  MaintenanceProcedureStepDto,
  StepResultStatus,
  StepType,
} from 'shared/common/models';

import { MntExecutionService } from '../../services';

export interface StepContext {
  index: number;
  step: StepWithResult;
  prev: MaintenanceProcedureStepDto | undefined;
  next: MaintenanceProcedureStepDto | undefined;
  form: FormGroup;
}

export interface StepWithResult extends MaintenanceProcedureStepDto {
  result?: MaintenanceExecutionStepResultDto;
}

@Component({
  selector: 'mnt-maintenance-execution-detail',
  templateUrl: './maintenance-execution-detail.component.html',
  styleUrls: ['./maintenance-execution-detail.component.scss'],
})
export class MaintenanceExecutionDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  resultStatus = StepResultStatus;

  execution: MaintenanceExecutionDto;
  isCollapsed = true;

  context$: Observable<StepContext> = this.activatedRoute.queryParams.pipe(
    map(params => {
      const arr = this.stepsWithResult;
      let index = arr.findIndex(s => s.id === params.step);
      index = Math.max(index, 0);

      const step = arr[index];
      const completedUntil = this.execution.completedAt
        ? 0
        : arr.findIndex(s => !s.result || s.result.status !== StepResultStatus.OK);

      return {
        index,
        step,
        prev: arr[index - 1] as MaintenanceProcedureStepDto | undefined,
        next: arr[index + 1] as MaintenanceProcedureStepDto | undefined,
        completedUntil,
        form: this.getStepForm(step),
      };
    }),
  );
  asset$: Observable<AssetDto>;

  get disabled() {
    const results =
      this.stepResults.filter(
        s => s.value && (s.status === StepResultStatus.OK || s.status === StepResultStatus.ERROR),
      ) || [];
    for (const step of this.execution.procedureSteps || []) {
      if (step.mandatory && !results.some(r => r.procedureStepId === step.id)) {
        return true;
      }
    }
    return false;
  }

  get procedureSteps() {
    return this.execution.procedureSteps || [];
  }

  get stepResults() {
    return this.execution.stepResults || [];
  }

  get stepsWithResult() {
    return this.procedureSteps.map(s => {
      const result = this.stepResults.find(r => r.procedureStepId === s.id);
      const status = this.getStepStatus({ ...s, result });
      return { ...s, result, status };
    });
  }

  get remainingHours() {
    return Math.round(moment(new Date()).diff(this.execution.dueDate, 'hours'));
  }

  get progress() {
    return this.execution.completedSteps;
  }

  get isOverDue(): boolean {
    return (
      !!this.execution.completedAt &&
      !!this.execution.dueDate &&
      new Date(this.execution.completedAt) > new Date(this.execution.dueDate)
    );
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private executionService: MntExecutionService,
    private assetService: AssetService,
    public fileService: FileService,
  ) {
    this.execution = this.activatedRoute.snapshot.data.execution;
    this.asset$ = from(this.assetService.getAsset(this.execution.assetId));
  }

  ngOnInit(): void {
    if (this.execution.completedAt) {
      return;
    }

    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const stepId = params.step as string | undefined;

      // Check if step exists, if not navigate to the first step.
      if (stepId && !this.procedureSteps.some(s => s.id === stepId)) {
        this.router.navigate([], {
          relativeTo: this.activatedRoute,
          queryParams: { step: this.procedureSteps[0].id },
          replaceUrl: true,
        });
        return;
      }

      // Completed steps can be viewed.
      if (this.stepResults.some(s => s.procedureStepId === stepId && s.value)) {
        return;
      }

      // Check if previous non skippable steps where completed, if not navigate to last completed.
      for (let i = 0; i < this.stepsWithResult.length; i++) {
        const step = this.stepsWithResult[i];
        if (!step.result || i >= this.stepsWithResult.length - 1) {
          this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: { step: step.id },
            replaceUrl: true,
          });
          return;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async completeStep(ctx: StepContext, status: StepResultStatus) {
    const value = ctx.form.value;

    await this.executionService.updateExecutionStep(this.execution.id, ctx.step.id, {
      value,
      status,
    });
    this.execution = await this.executionService.getExecution(this.execution.id);

    await this.nextStep(ctx);
  }

  async nextStep(ctx: StepContext) {
    const nextIndex = this.procedureSteps.findIndex(s => s.id === ctx.step.id);
    if (nextIndex < this.procedureSteps.length - 1) {
      await this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { step: this.procedureSteps[nextIndex + 1].id },
      });
    }
  }

  async complete() {
    await this.executionService.completeExecution(this.execution.id);
    await this.router.navigate(['/executions'], {
      queryParams: { assetId: this.execution.assetId },
    });
  }

  private getStepForm(step: StepWithResult) {
    switch (step.type) {
      case StepType.DESCRIPTION:
        return this.fb.group({});
      case StepType.NUMERIC_INPUT:
        return this.fb.group({ value: [null, Validators.required] });
      case StepType.TEXT_INPUT:
        return this.fb.group({ value: [null, Validators.required] });
      case StepType.CHECKBOX:
        return this.fb.group({
          value: [step.content.default, Validators.required],
        });
      default:
        return this.fb.group({});
    }
  }

  private getStepStatus(step: StepWithResult): 'done' | 'current' | 'error' | 'skipped' | 'open' {
    if (step.result?.status === StepResultStatus.SKIPPED) {
      return 'skipped';
    } else if (step.result?.status === StepResultStatus.ERROR) {
      return 'error';
    }

    if (step.position > this.execution.completedSteps) {
      return 'open';
    } else if (step.position === this.execution.completedSteps) {
      return 'current';
    }
    return 'done';
  }

  isInvalidForm(form: FormGroup): boolean {
    return form && form.invalid && (form.dirty || form.touched);
  }
}
