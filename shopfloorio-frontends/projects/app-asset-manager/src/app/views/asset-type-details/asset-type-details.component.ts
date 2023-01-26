import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AssetService, ModalConfirmComponent, ModalMessageComponent } from '@sio/common';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssetTypeDto, MultilangValue } from 'shared/common/models';

@Component({
  selector: 'app-asset-type-details',
  templateUrl: './asset-type-details.component.html',
  styleUrls: ['./asset-type-details.component.scss'],
})
export class AssetTypeDetailsComponent implements OnInit, OnDestroy {
  assetType = {} as AssetTypeDto;
  form!: FormGroup;
  editMode = false;

  name$ = new BehaviorSubject<MultilangValue | null>(null);

  private destroyed$ = new Subject<void>();

  get name(): AbstractControl {
    return this.form.get('name') as AbstractControl;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private assetService: AssetService,
    private toastrService: ToastrService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.form = this.buildForm();

    this.name.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(value => this.name$.next({ ...value }));

    if (this.route.snapshot.data['assetType']) {
      this.editMode = true;
      this.assetType = this.route.snapshot.data['assetType'];

      this.form.patchValue(this.assetType);
    }
  }

  async onSave() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.editMode
        ? await this.assetService.updateAssetType(this.assetType.id, this.form.value)
        : await this.assetService.createAssetType(this.form.value);

      this.router.navigate(['/asset-types']);
    } catch (ex) {
      this.toastrService.error(
        this.translateService.instant('MESSAGES.CHANGES_ARE_NOT_SAVED_DUE_TO_SOME_ERROR'),
        this.translateService.instant('MESSAGES.ERROR'),
      );
    }
  }

  async onDelete(): Promise<void> {
    const confirmed = await this.openConfirmModal();

    if (confirmed) {
      try {
        await this.assetService.deleteAssetType(this.assetType.id);
        this.router.navigate(['/asset-types']);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (ex: any) {
        const modal = this.modalService.open(ModalMessageComponent, { centered: true });

        modal.componentInstance.content = {
          title: 'MODALS.DELETE_ASSET_TYPE_ERROR_MESSAGE.TITLE',
          body: ex.message || 'MODALS.DELETE_ASSET_TYPE_ERROR_MESSAGE.BODY',
          dismiss: 'MODALS.DELETE_ASSET_TYPE_ERROR_MESSAGE.DISMISS',
        };
      }
    }
  }

  navigateToAllocatedTypes(): void {
    this.router.navigate(['asset-types']);
  }

  private openConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.TITLE',
      body: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_ASSET_TYPE_CONFIRM.ABORT',
    };
    return modal.result;
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      name: [null],
      description: [null],
      extendsType: [null],
      equipmentType: [null],
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
