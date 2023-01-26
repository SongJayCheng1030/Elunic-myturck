import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AssetService, DevicesService } from '@sio/common';
import { ToastrService } from 'ngx-toastr';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  from,
  map,
  Observable,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { AssetDto, AssetTypeDto } from 'shared/common/models';

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.scss'],
})
export class DeviceDetailsComponent implements OnInit {
  private refresh$ = new BehaviorSubject<null>(null);
  private assets$ = from(this.assetService.getAll()).pipe(shareReplay(1));
  private devices$ = this.refresh$.pipe(
    switchMap(() => this.devicesService.listDevices()),
    shareReplay(1),
  );

  deviceId!: string;
  availableAssets$: Observable<AssetDto[]> = this.getAvailableAssets();
  assetTypes: AssetTypeDto[] = [];
  assignedAsset$: Observable<AssetDto | undefined> = this.getAssignedAsset();

  constructor(
    private route: ActivatedRoute,
    private assetService: AssetService,
    private devicesService: DevicesService,
    private toastService: ToastrService,
    private translateService: TranslateService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.deviceId = this.route.snapshot.data['device'];
  }

  async onAssignAsset(asset: AssetDto): Promise<void> {
    this.devicesService
      .assignDevice(this.deviceId, asset.id)
      .pipe(
        tap(() => {
          this.toastService.success(this.translateService.instant('MESSAGES.ASSET_ASSIGNED'));
          this.refresh$.next(null);
        }),
        catchError((error: any) => {
          const message = error?.error?.message;
          this.toastService.error(
            this.translateService.instant(message || 'ERRORS.BACKEND_ERROR_MESSAGE'),
          );
          return EMPTY;
        }),
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
    );
  }
}
