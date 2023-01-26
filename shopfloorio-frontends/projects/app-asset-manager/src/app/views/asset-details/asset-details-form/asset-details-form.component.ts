import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetService, EnvironmentService } from '@sio/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssetTypeDto, FileResponse, MultilangValue } from 'shared/common/models';

@Component({
  selector: 'app-asset-details-form',
  templateUrl: './asset-details-form.component.html',
  styleUrls: ['./asset-details-form.component.scss'],
})
export class AssetDetailsFormComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();

  loading = true;
  form!: FormGroup;
  assetTypes!: AssetTypeDto[];
  selectedAssetType!: AssetTypeDto;

  @Input() assetTypeId!: string | null;
  @Input() parentForm!: FormGroup;
  @Input() parentAssetName?: MultilangValue;

  @Output() triggerEditing = new EventEmitter();

  get imageId(): AbstractControl {
    return this.form.get('imageId') as AbstractControl;
  }

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private readonly environment: EnvironmentService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.form = this.buildForm();
    this.form.patchValue(this.parentForm.value, { emitEvent: false });

    this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
      this.parentForm.patchValue(value);
      this.triggerEditing.emit();
    });

    this.assetTypes = await this.assetService.getAssetTypes();

    if (this.assetTypeId) {
      const assetType = this.assetTypes.find(a => a.id === this.assetTypeId);

      if (assetType) {
        this.selectedAssetType = assetType;
      }
    }

    if (!this.parentAssetName) {
      this.parentAssetName = {
        translate: 'VIEWS.ASSET_DETAILS.NONE',
      };
    }
    this.loading = false;
  }

  onUploadThumbnail(file: FileResponse): void {
    this.imageId.setValue(file.id);
  }

  onSelectAssetType(assetType: AssetTypeDto): void {
    this.selectedAssetType = assetType;
    this.form.patchValue({ assetType: assetType.id });
  }

  imageIdToUrl(imageId: string) {
    if (!imageId) {
      return '';
    }
    return `${this.environment.fileServiceUrl}v1/image/${imageId}`;
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      name: [null, Validators.required],
      assetType: [null, Validators.required],
      description: [null],
      imageId: [null],
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  resetData() {
    this.form.patchValue(this.parentForm.value, { emitEvent: false });
  }

  deleteImage() {
    this.form.get('imageId')?.setValue(null);
  }
}
