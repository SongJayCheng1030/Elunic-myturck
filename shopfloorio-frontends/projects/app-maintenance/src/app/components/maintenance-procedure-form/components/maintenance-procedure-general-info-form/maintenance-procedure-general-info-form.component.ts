import { Component, forwardRef, Input } from '@angular/core';
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
import { AssetService } from '@sio/common';
import { INTERVAL_UNITS } from 'shared/common/models';

export const MAINTENANCE_PROCEDURE_GENERAL_INFORMATION_CONTROL_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MntMaintenanceProcedureGeneralInfoFormComponent),
  multi: true,
};

const MAINTENANCE_PROCEDURE_GENERAL_INFORMATION_CONTROL_VALIDATORS = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MntMaintenanceProcedureGeneralInfoFormComponent),
  multi: true,
};

@UntilDestroy()
@Component({
  selector: 'mnt-maintenance-procedure-general-info-form',
  templateUrl: './maintenance-procedure-general-info-form.component.html',
  styleUrls: ['./maintenance-procedure-general-info-form.component.scss'],
  providers: [
    MAINTENANCE_PROCEDURE_GENERAL_INFORMATION_CONTROL_ACCESSOR,
    MAINTENANCE_PROCEDURE_GENERAL_INFORMATION_CONTROL_VALIDATORS,
  ],
})
export class MntMaintenanceProcedureGeneralInfoFormComponent implements ControlValueAccessor {
  form = new FormGroup({
    name: new FormControl('', [Validators.required, this.noWhitespaceValidator]),
    description: new FormControl('', Validators.required),
    interval: new FormControl(null, [Validators.required, Validators.min(1)]),
    intervalUnit: new FormControl(INTERVAL_UNITS[1], Validators.required),
    assetTypeId: new FormControl(null, Validators.required),
  });

  @Input()
  set isEdit(edit: boolean) {
    if (edit) {
      this.form.controls.assetTypeId.disable();
    } else {
      this.form.controls.assetTypeId.enable();
    }
  }

  assetTypes$ = this.assetService.getAssetTypes();
  intervalUnits = INTERVAL_UNITS;

  isCollapsed = false;

  onTouched: () => void = () => {};

  constructor(private assetService: AssetService) {}

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

  private noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }
}
