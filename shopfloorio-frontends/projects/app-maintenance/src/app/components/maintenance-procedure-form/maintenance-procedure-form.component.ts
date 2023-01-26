import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  forkJoin,
  from,
  map,
  Observable,
  of,
  shareReplay,
  tap,
} from 'rxjs';
import {
  MaintenanceProcedureDto,
  MaintenanceProcedureLibraryStepDto,
  MAX_COUNT_STEPS,
  MIN_COUNT_STEPS,
  StepType,
} from 'shared/common/models';
import { DocumentService } from '@sio/common';

import { MntStepLibraryService } from '../../services';
import {
  ADD_NEW_STEP_RESULT,
  MntProcedureStepFromLibrarySelectComponent,
} from './components/procedure-step-from-library-select/procedure-step-from-library-select.component';

const MAINTENANCE_PROCEDURE_CONTROL_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MntMaintenanceProcedureFormComponent),
  multi: true,
};

const MAINTENANCE_PROCEDURE_CONTROL_VALIDATORS = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MntMaintenanceProcedureFormComponent),
  multi: true,
};

export interface MntMaintenanceProcedureFormData {
  generalInfo: Omit<MaintenanceProcedureDto, 'id' | 'createdAt' | 'updatedAt' | 'steps'>;
  steps: MntMaintenanceProcedureStepFormData[];
}

export interface MntMaintenanceProcedureStepFormData {
  parentId?: string;
  saveToLibrary: boolean;
  step: MntMaintenanceProcedureStepDetailsFormData;
}

export interface MntMaintenanceProcedureStepDetailsFormData {
  id?: string;
  name: string;
  description: string;
  mandatory: boolean;
  skippable: boolean;
  images: string[];
  documents: string[];
  type: StepType;
  libraryOptions?: { tags: string[] };
  content: any;
  machineVariable?: {
    machineVariableId?: string;
    rangeFrom?: number;
    rangeTo?: number;
  };
}

interface StepNameWithSelection {
  name: string;
  selected: boolean;
}

@UntilDestroy()
@Component({
  selector: 'mnt-maintenance-procedure-form',
  templateUrl: './maintenance-procedure-form.component.html',
  styleUrls: ['./maintenance-procedure-form.component.scss'],
  providers: [MAINTENANCE_PROCEDURE_CONTROL_ACCESSOR, MAINTENANCE_PROCEDURE_CONTROL_VALIDATORS],
})
export class MntMaintenanceProcedureFormComponent implements ControlValueAccessor {
  @Input() isEdit = false;

  @Output() stepsChanged = new EventEmitter<boolean>();
  maxCountSteps = MAX_COUNT_STEPS;
  form = new FormGroup({
    generalInfo: new FormControl(null, Validators.required),
    steps: new FormArray(
      [],
      [
        Validators.required,
        Validators.minLength(MIN_COUNT_STEPS),
        Validators.maxLength(MAX_COUNT_STEPS),
      ],
    ),
  });
  stepTypes = Object.values(StepType);

  private _selectedStepIndex$ = new BehaviorSubject<number | null>(null);
  selectedStepIndex$ = this._selectedStepIndex$.pipe(distinctUntilChanged());

  saveToLibraryControl = new FormControl(false);

  stepNamesWithSelection$ = combineLatest([this._selectedStepIndex$, this.steps.valueChanges]).pipe(
    map(([selectedIndex, steps]) =>
      steps.map((value, index) => ({
        name:
          // we need to get the raw value when a library step is added as it's disabled
          value?.step?.name || (this.steps.at(index) as FormGroup).getRawValue().step?.name || '',
        selected: selectedIndex === index,
      })),
    ),
  );

  selectedStepForm$ = this._selectedStepIndex$.pipe(
    map(index => (index !== null ? (this.steps.at(index) as FormGroup) : null)),
    shareReplay(1),
  );

  saveToLibraryControl$ = this.selectedStepForm$.pipe(
    map(selectedStepForm => {
      // display no save to libary control when library step is selected
      return selectedStepForm?.controls.parentId
        ? null
        : selectedStepForm?.controls.saveToLibrary || null;
    }),
  );

  availableTags$: Observable<string[]> = from(this.stepLibraryService.listStepTags()).pipe(
    map(tags => tags.map(tag => tag.name)),
  );

  constructor(
    private readonly modalService: NgbModal,
    private readonly stepLibraryService: MntStepLibraryService,
    private readonly docService: DocumentService,
  ) {}

  onTouched: () => void = () => {};

  writeValue(val: MntMaintenanceProcedureFormData): void {
    if (val) {
      // unfortunately we need the 'setTimeout' to make sure the
      // forms 'valueChanges'-observable fires when initalized with a value
      setTimeout(() => {
        const { generalInfo, steps } = val;
        this.form.controls.generalInfo.patchValue(generalInfo);

        forkJoin(steps.map(stepData => this.addDocumentsToStep(stepData))).subscribe(steps => {
          steps.forEach(stepData => {
            this.steps.push(
              new FormGroup({
                step: new FormControl({ value: stepData.step, disabled: !!stepData.parentId }),
                saveToLibrary: new FormControl(false),
                parentId: new FormControl(stepData.parentId),
              }),
            );
          });
          this.selectStep(0);

          this.setupStepsChangedListener();
        });
      }, 0);
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

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable();
  }

  openStepFromLibraryModal() {
    const modalRef = this.modalService.open(MntProcedureStepFromLibrarySelectComponent, {
      centered: true,
      size: 'xl',
    });
    from(modalRef.result)
      .pipe(catchError(() => of(null)))
      .subscribe(result => {
        if (result === ADD_NEW_STEP_RESULT) {
          this.addStep();
        } else if (result) {
          this.addStepsFromLibary(result);
        }
      });
  }

  addStepsFromLibary(steps: MaintenanceProcedureLibraryStepDto[]) {
    const index = this.steps.length;

    steps.forEach(step => {
      this.steps.push(
        new FormGroup({
          step: new FormControl({ value: this.transformLibraryStep(step), disabled: true }),
          saveToLibrary: new FormControl(true),
          parentId: new FormControl(step.id),
        }),
      );
    });
    this._selectedStepIndex$.next(index);
  }

  addStep(position?: number) {
    const index = position || this.steps.length;
    this.steps.insert(
      index,
      new FormGroup({
        step: new FormControl(null, Validators.required),
        saveToLibrary: new FormControl(false),
      }),
    );
    this._selectedStepIndex$.next(index);
  }

  selectStep(index: number) {
    this._selectedStepIndex$.next(index);
  }

  onStepItemDrop({ previousIndex, currentIndex }: CdkDragDrop<StepNameWithSelection>) {
    const dir = currentIndex > previousIndex ? 1 : -1;
    const stepForms = this.steps;

    const item = stepForms.at(previousIndex);
    for (let i = previousIndex; i * dir < currentIndex * dir; i = i + dir) {
      const current = stepForms.at(i + dir);
      stepForms.setControl(i, current);
    }
    stepForms.setControl(currentIndex, item);

    this._selectedStepIndex$.next(currentIndex);
  }

  removeStep() {
    const selectedStepIndex = this._selectedStepIndex$.value;
    if (selectedStepIndex !== null) {
      this.steps.removeAt(selectedStepIndex);
      if (this.steps.length) {
        this._selectedStepIndex$.next(Math.max(selectedStepIndex, 0));
      } else {
        this._selectedStepIndex$.next(null);
      }
      if (selectedStepIndex > 0) {
        this.selectStep(selectedStepIndex - 1);
      }
    }
  }

  get steps(): FormArray {
    return this.form.controls.steps as FormArray;
  }

  private setupStepsChangedListener(): void {
    this.steps.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.stepsChanged.emit(true));
  }

  private transformLibraryStep({
    name,
    description,
    mandatory,
    skippable,
    content,
    tags,
    type,
    machineVariableId,
    rangeFrom,
    rangeTo,
  }: MaintenanceProcedureLibraryStepDto): MntMaintenanceProcedureStepDetailsFormData {
    const { images, documents, ...restContent } = content;
    return {
      name,
      description,
      mandatory,
      skippable,
      images,
      documents,
      type,
      libraryOptions: { tags: tags || [] },
      machineVariable: {
        machineVariableId,
        rangeFrom,
        rangeTo,
      },
      content: restContent,
    };
  }

  private addDocumentsToStep(
    stepData: MntMaintenanceProcedureStepFormData,
  ): Observable<MntMaintenanceProcedureStepFormData> {
    return from(this.docService.getDocuments({ refIds: stepData.step.id })).pipe(
      map(documents => ({
        ...stepData,
        step: {
          ...stepData.step,
          documents: documents.map(({ id }) => id),
        },
      })),
    );
  }
}
