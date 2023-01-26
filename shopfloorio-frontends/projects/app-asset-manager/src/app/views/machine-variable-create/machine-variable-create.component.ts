import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AssetService, DevicesService, MachineVariablesService } from '@sio/common';
import { ToastrService } from 'ngx-toastr';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { AssetTypeDto } from 'shared/common/models';

@Component({
  selector: 'app-machine-variable-create',
  templateUrl: './machine-variable-create.component.html',
  styleUrls: ['./machine-variable-create.component.scss'],
})
export class MachineVariableCreateComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl(null, Validators.required),
    parameterId: new FormControl(null, Validators.required),
    unit: new FormControl(null),
    assetTypeId: new FormControl(null, Validators.required),
  });
  assetTypes: AssetTypeDto[] | undefined = undefined;
  parameterIds: string[] = [];
  assetTypesLoading = true;
  sensorsLoading = true;

  private destroy$ = new Subject<void>();
  private q$ = new BehaviorSubject<string | undefined>(undefined);

  constructor(
    public activeModal: NgbActiveModal,
    private machineVariablesService: MachineVariablesService,
    private assetService: AssetService,
    private deviceService: DevicesService,
    private readonly toastService: ToastrService,
    private readonly router: Router,
    private readonly translateService: TranslateService,
  ) {}

  async ngOnInit() {
    this.q$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(333),
        tap(() => (this.sensorsLoading = true)),
        switchMap(q =>
          this.deviceService
            .findSensors(q && q.length > 2 ? q : undefined)
            .pipe(catchError(() => this.parameterIds)),
        ),
      )
      .subscribe(ids => {
        this.parameterIds = ids;
        this.sensorsLoading = false;
      });

    this.assetTypes = await this.assetService.getAssetTypes();
    this.assetTypesLoading = false;
  }

  onSearch(q?: { term: string }) {
    this.q$.next(q && q.term.length > 2 ? q.term : undefined);
  }

  close() {
    this.activeModal.close();
    this.router.navigate(['/machine-variables']);
  }

  save() {
    if (!this.form.valid) {
      return;
    }

    this.machineVariablesService.createMachineVariable(this.form.value).subscribe({
      next: () => {
        this.toastService.success(
          this.translateService.instant('MESSAGES.MACHINE_VARIABLE_CREATED'),
        );
        this.activeModal.close(true);
        this.router.navigate(['/machine-variables']);
      },
      error: () => {
        this.activeModal.close(false);
        this.toastService.error(
          this.translateService.instant('MESSAGES.CHANGES_ARE_NOT_SAVED_DUE_TO_SOME_ERROR'),
        );
        this.router.navigate(['/machine-variables']);
      },
    });
  }
}
