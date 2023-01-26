import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { AssetService } from '@sio/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssetTypeDto, ISA95EquipmentHierarchyModelElement } from 'shared/common/models';

@Component({
  selector: 'app-asset-type-details-form',
  templateUrl: './asset-type-details-form.component.html',
  styleUrls: ['./asset-type-details-form.component.scss'],
})
export class AssetTypeDetailsFormComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();

  form!: FormGroup;
  loading = true;
  assetTypes: AssetTypeDto[] = [];
  equipmentTypes = Object.values(ISA95EquipmentHierarchyModelElement);
  selectedExtendsType!: AssetTypeDto | null;

  @Input() parentForm!: FormGroup;
  @Input() assetType!: AssetTypeDto;

  get equipmentType(): AbstractControl {
    return this.form.get('equipmentType') as AbstractControl;
  }

  constructor(private fb: FormBuilder, private assetService: AssetService) {}

  async ngOnInit(): Promise<void> {
    this.form = this.buildForm();
    this.form.patchValue(this.parentForm.value, { emitEvent: false });

    this.selectedExtendsType = this.assetType.extendsType;

    if (this.assetType.equipmentType) {
      this.equipmentType.setValue(this.assetType.equipmentType);
    }

    this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
      this.parentForm.patchValue(value);
    });

    this.assetTypes = await this.assetService.getAssetTypes();
    this.loading = false;
  }

  onSelectEquipmentType(equipmentType: ISA95EquipmentHierarchyModelElement): void {
    this.form.patchValue({ equipmentType });
  }

  onSelectAssetType(assetType: AssetTypeDto | null): void {
    this.selectedExtendsType = assetType;
    this.form.patchValue({ extendsType: assetType?.id || null });
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
