import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AssetService, ModalConfirmComponent, ModalMessageComponent } from '@sio/common';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssetDto, AssetTreeNodeDto, MultilangValue } from 'shared/common/models';

import { AssetDetailsFormComponent } from './asset-details-form/asset-details-form.component';
import { AssetDynamicPropertiesComponent } from './asset-dynamic-properties/asset-dynamic-properties.component';

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss'],
})
export class AssetDetailsComponent implements OnInit, OnDestroy {
  asset = {} as AssetDto;
  form!: FormGroup;
  parent: AssetDto | null = null;
  parentIdFromQueryParams!: string;
  editMode = false;
  changedProperties: Array<{
    value?: string;
    position: number | null;
    id: string;
  }> = [];
  saveButtonEnabled = false;
  isDeallocateEnable = false;

  name$ = new BehaviorSubject<MultilangValue | null>(null);

  private hasChildren = false;
  private assetTree: AssetTreeNodeDto[] = [];
  private destroyed$ = new Subject<void>();

  get name(): AbstractControl {
    return this.form.get('name') as AbstractControl;
  }

  @ViewChild(AssetDetailsFormComponent) assetDetailsFormComponent!: AssetDetailsFormComponent;
  @ViewChild(AssetDynamicPropertiesComponent)
  assetDynamicPropertiesComponent!: AssetDynamicPropertiesComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private assetService: AssetService,
    private toastrService: ToastrService,
    private translateService: TranslateService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.form = this.buildForm();
    this.parentIdFromQueryParams = this.route.snapshot.queryParams['parentId'];

    this.name.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(value => this.name$.next({ ...value }));

    if (this.route.snapshot.data['asset']) {
      this.editMode = true;
      this.asset = this.route.snapshot.data['asset'];

      this.form.patchValue(this.asset);

      this.assetTree = await this.assetService.getAssetTree();

      this.parent = this.getParen();
      this.hasChildren = this.getChildren().length > 0;
    }
    this.isDeallocateEnable = this.route.snapshot.queryParams['deallocate'];
  }

  async onSave() {
    try {
      if (this.editMode) {
        await this.updateProperties();
        await this.assetService.updateAsset(this.asset.id, this.form.value);
        await this.assetDynamicPropertiesComponent.resetData();

        this.toastrService.success(
          this.translateService.instant('MESSAGES.CHANGES_SAVED'),
          this.translateService.instant('MESSAGES.SUCCESS'),
        );
      } else {
        const asset = await this.assetService.createAsset(this.form.value);
        if (this.parentIdFromQueryParams && asset) {
          this.assetService.transform(asset.id, this.parentIdFromQueryParams);
        }
        if (asset) {
          this.router.navigate(['assets', asset.id]);
        }
      }

      this.saveButtonEnabled = false;
    } catch (ex) {
      this.toastrService.error(
        this.translateService.instant('MESSAGES.CHANGES_ARE_NOT_SAVED_DUE_TO_SOME_ERROR'),
        this.translateService.instant('MESSAGES.ERROR'),
      );
    }
  }

  async onDeallocate(): Promise<void> {
    if (this.hasChildren) {
      return this.openInvalidActionModal();
    }

    try {
      await this.assetService.deallocate(this.asset.id, this.parent?.id || null);
      // eslint-disable-next-line no-empty
    } catch (ex) {}
  }

  async onDelete(): Promise<void> {
    if (this.hasChildren) {
      return this.openInvalidActionModal();
    }

    const confirmed = await this.openConfirmModal();

    if (confirmed) {
      try {
        await this.onDeallocate();
        await this.assetService.deleteAsset(this.asset.id);
        // this.router.navigate(['/assets']);
        this.navigateBack();
        // eslint-disable-next-line no-empty
      } catch (ex) {}
    }
  }

  navigateBack() {
    this.router.navigate(['/allocated-assets']);
  }

  triggerEditing() {
    this.saveButtonEnabled = true;
  }

  async resetChanges() {
    const asset = await this.assetService.getAsset(this.route.snapshot.data['asset'].id);
    if (!asset) return;

    this.form.patchValue(asset, { emitEvent: false });
    this.name.setValue(asset.name);
    this.assetDetailsFormComponent.resetData();
    this.assetDynamicPropertiesComponent.resetData();

    this.saveButtonEnabled = false;
  }

  private openInvalidActionModal(): void {
    const modal = this.modalService.open(ModalMessageComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_MESSAGE.TITLE',
      body: 'MODALS.DELETE_ASSET_MESSAGE.BODY',
      dismiss: 'MODALS.DELETE_ASSET_MESSAGE.DISMISS',
    };
  }

  private openConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_ASSET_CONFIRM.TITLE',
      body: 'MODALS.DELETE_ASSET_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_ASSET_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_ASSET_CONFIRM.ABORT',
    };
    return modal.result;
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      imageId: [null],
      name: [null],
      assetType: [null],
      description: [null],
      aliases: [[]],
      documents: [[]],
    });
  }

  private getParen(): AssetDto | null {
    const stack = [...this.assetTree];

    while (stack.length) {
      const node = stack.shift() as AssetTreeNodeDto;

      if (node.children.some(child => child.id === this.asset.id)) {
        return node;
      }
      stack.push(...node.children);
    }
    return null;
  }

  private getChildren(): AssetTreeNodeDto[] {
    const stack = [...this.assetTree];

    while (stack.length) {
      const node = stack.shift() as AssetTreeNodeDto;

      if (node.id === this.asset.id) {
        return node.children;
      }
      stack.push(...node.children);
    }
    return [];
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  setChangedProperties(
    properties: Array<{
      value?: string;
      position: number | null;
      id: string;
    }>,
  ) {
    this.changedProperties = properties;
  }

  async updateProperties() {
    const promises = this.changedProperties.map(property => {
      return this.assetService.updateAssetProperty(this.asset.id, property.id, {
        value: property.value,
        position: property.position,
      });
    });

    await Promise.all(promises);
  }
}
