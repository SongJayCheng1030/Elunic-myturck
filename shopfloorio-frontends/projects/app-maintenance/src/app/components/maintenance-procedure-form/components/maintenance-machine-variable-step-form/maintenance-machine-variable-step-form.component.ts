import { ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { startWith } from 'rxjs';
import { MachineVariableDto } from 'shared/common/models';

const MAINTENANCE_MACHINE_VARIABLE_STEP_CONTROL_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MntMaintenanceMachineVariableStepFormComponent),
  multi: true,
};

const MAINTENANCE_MACHINE_VARIABLE_STEP_CONTROL_VALIDATORS = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MntMaintenanceMachineVariableStepFormComponent),
  multi: true,
};

const rangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const machineVariableId = control.get('machineVariableId')?.value;
  const rangeFrom = control.get('rangeFrom')?.value;
  const rangeTo = control.get('rangeTo')?.value;
  if (machineVariableId && rangeFrom && rangeTo && rangeFrom >= rangeTo) {
    return { invalidRangeError: true };
  }

  return null;
};

@UntilDestroy()
@Component({
  selector: 'mnt-maintenance-machine-variable-step-form',
  templateUrl: './maintenance-machine-variable-step-form.component.html',
  styleUrls: ['./maintenance-machine-variable-step-form.component.scss'],
  providers: [
    MAINTENANCE_MACHINE_VARIABLE_STEP_CONTROL_ACCESSOR,
    MAINTENANCE_MACHINE_VARIABLE_STEP_CONTROL_VALIDATORS,
  ],
})
export class MntMaintenanceMachineVariableStepFormComponent implements ControlValueAccessor {
  form = new FormGroup(
    {
      machineVariableId: new FormControl(null),
      rangeFrom: new FormControl(null),
      rangeTo: new FormControl(null),
    },
    { validators: rangeValidator },
  );

  @Input() isEdit = false;

  @Input() machineVariables!: MachineVariableDto[];
  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    const { rangeFrom, rangeTo, machineVariableId } = this.form.controls;
    machineVariableId.valueChanges
      .pipe(untilDestroyed(this), startWith(machineVariableId.value))
      .subscribe(value => {
        if (value) {
          rangeFrom.enable();
          rangeTo.enable();
        } else {
          rangeFrom.patchValue(null);
          rangeTo.patchValue(null);
          rangeFrom.disable();
          rangeTo.disable();
        }
      });
  }
  onTouched: () => void = () => {};

  writeValue(val: any): void {
    if (val) {
      this.cdRef.detectChanges();
      this.form.patchValue(val);
    }
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

  resetRanges() {
    this.form.reset();
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.isEdit) {
      this.form.controls['type'].disable({ emitEvent: false });
    } else if (isDisabled) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }

  isInvalidForm(field: string): boolean {
    return (
      this.form.controls[field].invalid &&
      (this.form.controls[field].dirty || this.form.controls[field].touched)
    );
  }
}
