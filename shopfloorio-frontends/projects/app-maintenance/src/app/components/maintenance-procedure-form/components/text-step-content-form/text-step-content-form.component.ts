import { Component, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { StepType } from 'shared/common/models';

const TEXT_STEP_CONTENT_CONTROL_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MntTextContentStepFormComponent),
  multi: true,
};

const TEXT_STEP_CONTENT_CONTROL_VALIDATORS = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MntTextContentStepFormComponent),
  multi: true,
};

@UntilDestroy()
@Component({
  selector: 'mnt-text-step-content-form',
  templateUrl: './text-step-content-form.component.html',
  styleUrls: ['./text-step-content-form.component.scss'],
  providers: [TEXT_STEP_CONTENT_CONTROL_ACCESSOR, TEXT_STEP_CONTENT_CONTROL_VALIDATORS],
})
export class MntTextContentStepFormComponent implements ControlValueAccessor {
  stepTypes = Object.values(StepType);

  form = new FormGroup({
    label: new FormControl('', Validators.required),
  });

  onTouched: () => void = () => {};

  writeValue(val: any): void {
    val && this.form.patchValue(val, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.form.valueChanges.pipe(untilDestroyed(this)).subscribe(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  validate(): ValidationErrors | null {
    return this.form.valid ? null : { error: true };
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable();
  }

  isInvalidForm(field: string): boolean {
    return (
      this.form.controls[field].invalid &&
      (this.form.controls[field].dirty || this.form.controls[field].touched)
    );
  }
}
