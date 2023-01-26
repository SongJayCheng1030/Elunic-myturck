import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { MntMaintenanceProcedureStepFormData } from '../../components/maintenance-procedure-form/maintenance-procedure-form.component';
import { MntStepLibraryService } from '../../services';

@Component({
  selector: 'mnt-maintenance-step-library-create',
  templateUrl: './maintenance-step-library-create.component.html',
  styleUrls: ['./maintenance-step-library-create.component.scss'],
})
export class MaintenanceStepLibraryCreateComponent {
  constructor(
    private readonly router: Router,
    private readonly stepLibraryService: MntStepLibraryService,
  ) {}

  async onSave(data: MntMaintenanceProcedureStepFormData) {
    const { libraryOptions, images, documents, machineVariable, ...step } = data.step;
    await this.stepLibraryService.createLibraryStep({
      ...step,
      ...machineVariable,
      ...(libraryOptions?.tags?.length ? { tags: libraryOptions.tags } : {}),
      content: { ...step.content, images, documents },
    });
    await this.router.navigate(['/steps-library']);
  }
}
