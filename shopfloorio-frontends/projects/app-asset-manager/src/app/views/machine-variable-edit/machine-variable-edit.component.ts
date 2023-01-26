import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { MachineVariablesQuery, MachineVariablesService } from '@sio/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-machine-variable-edit',
  templateUrl: './machine-variable-edit.component.html',
  styleUrls: ['./machine-variable-edit.component.scss'],
})
export class MachineVariableEditComponent implements OnInit {
  variableId!: string;

  form = new FormGroup({
    name: new FormControl(null, Validators.required),
    unit: new FormControl(null),
  });

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly machineVariablesService: MachineVariablesService,
    private readonly machineVariablesQuery: MachineVariablesQuery,
    private readonly toastService: ToastrService,
    private readonly router: Router,
    private readonly translateService: TranslateService,
  ) {}

  ngOnInit() {
    const entity = this.machineVariablesQuery.getEntity(this.variableId);
    if (entity) {
      this.form.patchValue(entity);
    }
  }

  close() {
    this.activeModal.close();
    this.router.navigate(['/machine-variables']);
  }

  save() {
    if (!this.form.valid) {
      return;
    }

    this.machineVariablesService.updateMachineVariable(this.form.value, this.variableId).subscribe({
      next: () => {
        this.toastService.success(
          this.translateService.instant('MESSAGES.MACHINE_VARIABLE_UPDATED'),
        );
        this.activeModal.close(true);
      },
      error: () =>
        this.toastService.error(
          this.translateService.instant('MESSAGES.CHANGES_ARE_NOT_SAVED_DUE_TO_SOME_ERROR'),
        ),
    });
  }
}
