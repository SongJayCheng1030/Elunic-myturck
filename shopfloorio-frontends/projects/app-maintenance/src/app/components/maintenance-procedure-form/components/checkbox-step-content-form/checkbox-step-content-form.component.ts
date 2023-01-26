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

const CHECKBOX_STEP_CONTENT_CONTROL_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MntCheckboxContentStepFormComponent),
  multi: true,
};

const CHECKBOX_STEP_CONTENT_CONTROL_VALIDATORS = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MntCheckboxContentStepFormComponent),
  multi: true,
};

@UntilDestroy()
@Component({
  selector: 'mnt-checkbox-step-content-form',
  templateUrl: './checkbox-step-content-form.component.html',
  styleUrls: ['./checkbox-step-content-form.component.scss'],
  providers: [CHECKBOX_STEP_CONTENT_CONTROL_ACCESSOR, CHECKBOX_STEP_CONTENT_CONTROL_VALIDATORS],
})
export class MntCheckboxContentStepFormComponent implements ControlValueAccessor {
  stepTypes = Object.values(StepType);

  form = new FormGroup({
    label: new FormControl('', Validators.required),
    default: new FormControl(false, Validators.required),
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
