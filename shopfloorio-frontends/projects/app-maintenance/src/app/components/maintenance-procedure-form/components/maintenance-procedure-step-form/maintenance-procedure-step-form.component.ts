import { ChangeDetectorRef, Component, forwardRef, Input, OnInit } from '@angular/core';
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
import { MntMachineVariablesService } from 'projects/app-maintenance/src/app/services/machien-variables.service';
import { from } from 'rxjs';
import { filter, skip } from 'rxjs/operators';
import { StepType } from 'shared/common/models';

const MAINTENANCE_PROCEDURE_STEP_CONTROL_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MntMaintenanceProcedureStepFormComponent),
  multi: true,
};

const MAINTENANCE_PROCEDURE_STEP_CONTROL_VALIDATORS = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MntMaintenanceProcedureStepFormComponent),
  multi: true,
};

@UntilDestroy()
@Component({
  selector: 'mnt-maintenance-procedure-step-form',
  templateUrl: './maintenance-procedure-step-form.component.html',
  styleUrls: ['./maintenance-procedure-step-form.component.scss'],
  providers: [
    MAINTENANCE_PROCEDURE_STEP_CONTROL_ACCESSOR,
    MAINTENANCE_PROCEDURE_STEP_CONTROL_VALIDATORS,
  ],
})
export class MntMaintenanceProcedureStepFormComponent implements OnInit, ControlValueAccessor {
  @Input() isEdit = false;

  stepTypes = Object.values(StepType);

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    mandatory: new FormControl(true, Validators.required),
    skippable: new FormControl(false, Validators.required),
    type: new FormControl(StepType.DESCRIPTION, Validators.required),
    description: new FormControl('', Validators.required),
    images: new FormControl([]),
    documents: new FormControl([]),
    content: new FormControl({}),
    machineVariable: new FormControl({}),
    libraryOptions: new FormGroup({
      tags: new FormControl([]),
    }),
  });

  machineVariables$ = from(this.machineVariablesService.listMachineVariables());

  @Input()
  stepId?: string;

  @Input()
  set saveToLibrary(saveToLibrary: boolean) {
    this._saveToLibrary = saveToLibrary;
    this.onSaveToLibraryChange(saveToLibrary);
  }

  get saveToLibrary(): boolean {
    return this._saveToLibrary;
  }

  private _saveToLibrary = false;

  @Input()
  availableTags: string[] = [];

  constructor(
    private cdRef: ChangeDetectorRef,
    private readonly machineVariablesService: MntMachineVariablesService,
  ) {}

  ngOnInit(): void {
    this.setupContentReset();
  }

  onTouched: () => void = () => {};

  writeValue(val: any): void {
    if (val) {
      // trigger manual change detection run to avoid
      // ExpressionChangedAfterItHasBeenCheckedError
      this.cdRef.detectChanges();
      this.form.patchValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.form.valueChanges
      .pipe(
        untilDestroyed(this),
        skip(1),
        filter(() => !this.form.disabled),
      )
      .subscribe(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  validate(): ValidationErrors | null {
    return this.form.valid ? null : { error: true };
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

  addTag(tag: string): string {
    return tag;
  }

  private setupContentReset(): void {
    this.form.controls.type.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.form.controls.content.setValue({}, { emitEvent: false }));
  }

  private onSaveToLibraryChange(saveToLibrary: boolean): void {
    const LIBRARY_OPTIONS_CONTROL_NAME = 'libraryOptions';
    if (saveToLibrary) {
      this.form.addControl(
        LIBRARY_OPTIONS_CONTROL_NAME,
        new FormGroup({
          tags: new FormControl([]),
        }),
      );
    } else {
      this.form.removeControl(LIBRARY_OPTIONS_CONTROL_NAME);
    }
  }

  isInvalidForm(field: string): boolean {
    return (
      this.form.controls[field].invalid &&
      (this.form.controls[field].dirty || this.form.controls[field].touched)
    );
  }
}
