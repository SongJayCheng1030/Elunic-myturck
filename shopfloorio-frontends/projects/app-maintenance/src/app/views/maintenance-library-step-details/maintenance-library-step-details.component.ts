import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentService } from '@sio/common';
import { from, map, Observable, switchMap, take } from 'rxjs';
import { MaintenanceProcedureLibraryStepDto } from 'shared/common/models';
import { MntMaintenanceProcedureStepDetailsFormData } from '../../components/maintenance-procedure-form/maintenance-procedure-form.component';
import { MntStepLibraryService } from '../../services';
import { MntLibraryStepsQuery } from '../../state/library-steps/libarary-steps.query';
import { MntLibraryStepsService } from '../../state/library-steps/library-steps.service';

@Component({
  selector: 'mnt-maintenance-library-step-details',
  templateUrl: './maintenance-library-step-details.component.html',
  styleUrls: ['./maintenance-library-step-details.component.scss'],
})
export class MntMaintenanceLibraryStepDetailsComponent implements OnInit {
  availableTags$: Observable<string[]> = from(this.stepLibraryService.listStepTags()).pipe(
    map(tags => tags.map(tag => tag.name)),
  );

  form!: FormGroup;

  constructor(
    private stepLibraryService: MntStepLibraryService,
    private libraryStepsService: MntLibraryStepsService,
    private docService: DocumentService,
    private router: Router,
    private libraryStepsQuery: MntLibraryStepsQuery,
  ) {}

  ngOnInit(): void {
    (this.libraryStepsQuery.selectActive() as Observable<MaintenanceProcedureLibraryStepDto>)
      .pipe(
        take(1),
        switchMap(libraryStep =>
          from(this.docService.getDocuments({ refIds: libraryStep?.id })).pipe(
            map(documents => ({
              ...libraryStep,
              documents: documents.map(({ id }) => id),
            })),
          ),
        ),
      )
      .subscribe({
        next: libraryStep =>
          (this.form = new FormGroup({
            step: new FormControl({
              value: this.transformLibraryStep(libraryStep),
              disabled: true,
            }),
            saveToLibrary: new FormControl(false),
            parentId: new FormControl(libraryStep.id),
          })),
      });
  }

  onDelete() {
    from(
      this.libraryStepsService.deleteLibraryStep(
        (this.libraryStepsQuery.getActive() as MaintenanceProcedureLibraryStepDto).id,
      ),
    )
      .pipe(map(() => this.router.navigate(['/steps-library'])))
      .subscribe();
  }

  private transformLibraryStep({
    name,
    description,
    documents,
    mandatory,
    skippable,
    content,
    tags,
    type,
    machineVariableId,
    rangeFrom,
    rangeTo,
  }: MaintenanceProcedureLibraryStepDto & {
    documents: string[];
  }): MntMaintenanceProcedureStepDetailsFormData {
    const { images, ...restContent } = content;
    return {
      name,
      description,
      mandatory,
      skippable,
      images: images || [],
      documents: documents || [],
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
}
