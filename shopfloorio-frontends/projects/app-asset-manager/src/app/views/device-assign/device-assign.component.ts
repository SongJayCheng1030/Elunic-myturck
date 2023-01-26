import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AssetService, DevicesService } from '@sio/common';
import { ToastrService } from 'ngx-toastr';
import {
  catchError,
  combineLatest,
  EMPTY,
  finalize,
  forkJoin,
  from,
  map,
  Observable,
  shareReplay,
  take,
  tap,
} from 'rxjs';
import { AssetDto } from 'shared/common/models';

@Component({
  selector: 'app-device-management-assign',
  templateUrl: './device-assign.component.html',
  styleUrls: ['./device-assign.component.scss'],
})
export class DeviceManagementAssignComponent implements OnInit {
  deviceId!: string;
  assetsLoading = true;

  private assets$ = from(this.assetService.getAll()).pipe(
    shareReplay(1),
    tap(() => (this.assetsLoading = false)),
  );
  private devices$ = this.devicesService.listDevices();
  private assignedAsset$: Observable<AssetDto | undefined> = this.getAssignedAsset();

  availableAssets$: Observable<AssetDto[]> = forkJoin([
    this.getAvailableAssets(),
    this.assignedAsset$,
  ]).pipe(map(([available, assigned]) => [...available, ...(assigned ? [assigned] : [])]));

  form = new FormGroup({ assetId: new FormControl(null, Validators.required) });

  constructor(
    public activeModal: NgbActiveModal,
    private assetService: AssetService,
    private devicesService: DevicesService,
    private readonly toastService: ToastrService,
    private readonly router: Router,
    private readonly translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.assignedAsset$
      .pipe(
        tap(assignedAsset => {
          if (assignedAsset) {
            this.form.patchValue({ assetId: assignedAsset.id });
          }
        }),
        take(1),
      )
      .subscribe();
  }

  goToManagementDevice() {
    this.router.navigate(['/device-management']);
  }

  close() {
    this.activeModal.close();
    this.goToManagementDevice();
  }

  async save() {
    if (!this.form.valid) {
      return;
    }

    const assetId = this.form.value.assetId;

    this.devicesService
      .assignDevice(this.deviceId, assetId)
      .pipe(
        tap(() => {
          this.toastService.success(this.translateService.instant('MESSAGES.ASSET_ASSIGNED'));
          this.activeModal.close(true);
        }),
        catchError((error: any) => {
          const message = error?.error?.message;
          this.activeModal.close(false);
          this.toastService.error(
            this.translateService.instant(message || 'ERRORS.BACKEND_ERROR_MESSAGE'),
          );
          return EMPTY;
        }),
        finalize(() => this.goToManagementDevice()),
      )
      .subscribe();
  }

  private getAvailableAssets(): Observable<AssetDto[]> {
    return combineLatest([this.assets$, this.devices$]).pipe(
      map(([assets, devices]) =>
        assets.filter(({ id }) => !devices.some(device => device.assetId === id)),
      ),
    );
  }

  private getAssignedAsset(): Observable<AssetDto | undefined> {
    return combineLatest([this.assets$, this.devices$]).pipe(
      map(([assets, devices]) => {
        const assetId = devices.find(({ id }) => id === this.deviceId)?.assetId;
        if (!assetId) {
          return undefined;
        }
        return assets.find(({ id }) => id === assetId);
      }),
      shareReplay(1),
    );
  }
}
