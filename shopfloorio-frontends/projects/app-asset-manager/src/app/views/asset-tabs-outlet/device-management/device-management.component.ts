import { ColDef, GridOptions } from '@ag-grid-community/core';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import {
  AgGridActionDropdownComponent,
  AgGridBaseDirective,
  AgGridTextSearchFloatingFilterComponent,
  AssetService,
  DevicesService,
  GRID_ROW_HEIGHT,
} from '@sio/common';
import { BehaviorSubject, combineLatest, from, map, shareReplay, switchMap } from 'rxjs';
import { DeviceManagementAssignComponent } from '../../device-assign/device-assign.component';
import { DeviceManagementCreateComponent } from '../../device-create/device-create.component';

@Component({
  selector: 'app-device-management',
  templateUrl: './device-management.component.html',
  styleUrls: ['./device-management.component.scss'],
  providers: [NgbModalConfig, NgbModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetDeviceManagementComponent extends AgGridBaseDirective implements OnInit {
  gridOptions: GridOptions = {
    ...this.gridBaseOptions,
    onCellClicked: event => this.router.navigate(['/devices', event.data.id]),
  };

  private reloadDeviceListSubject$ = new BehaviorSubject<null>(null);

  private assets$ = from(this.assetService.getAll()).pipe(shareReplay(1));

  devicesWithAssets$ = this.reloadDeviceListSubject$.pipe(
    switchMap(() => combineLatest([this.devicesService.listDevices(), this.assets$])),
    map(([devices, assets]) =>
      devices.map(device => ({
        ...device,
        asset: assets.find(asset => asset.id === device.assetId),
      })),
    ),
  );

  columnDefs: ColDef[] = [
    {
      headerName: 'Identifier',
      field: 'id',
      filter: 'agTextColumnFilter',
      floatingFilterComponent: AgGridTextSearchFloatingFilterComponent,
      floatingFilter: true,
      sortable: true,
    },
    {
      headerName: 'Asset',
      field: 'asset',
      filter: 'agTextColumnFilter',
      floatingFilterComponent: AgGridTextSearchFloatingFilterComponent,
      floatingFilter: true,
      sortable: true,
      valueGetter: ({ data }) =>
        data.asset?.name
          ? this.getMultilangName(data.asset.name)
          : this.translateService.instant('VIEWS.DEVICE_MANAGEMENT.NOT_ASSIGNED'),
    },
    {
      width: GRID_ROW_HEIGHT,
      pinned: 'right',
      suppressSizeToFit: true,
      cellRenderer: AgGridActionDropdownComponent,
      cellClass: 'full-width',
      cellRendererParams: {
        actions: [
          {
            name: this.translateService.instant('VIEWS.DEVICE_MANAGEMENT.ASSIGN'),
            callback: id => this.onAssign(id),
          },
          {
            name: this.translateService.instant('VIEWS.DEVICE_MANAGEMENT.UNASSIGN'),
            callback: id => this.onUnassign(id),
          },
        ],
      },
      resizable: false,
    },
  ];

  constructor(
    private assetService: AssetService,
    private router: Router,
    private devicesService: DevicesService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    config: NgbModalConfig,
  ) {
    super(translateService);
    config.backdrop = 'static';
    config.keyboard = false;
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params?.mode === 'create') {
        this.openAddDeviceModal();
      }
    });
    await this.reloadDeviceList();
  }

  onAssign(id: string): void {
    this.openAssignAssetModal(id);
  }

  onUnassign(id: string): void {
    this.devicesService.unassignDevice(id).subscribe(() => this.reloadDeviceList());
  }

  async openAssignAssetModal(deviceId: string) {
    const modal = this.modalService.open(DeviceManagementAssignComponent, {
      size: 'sm',
      centered: true,
    });
    modal.componentInstance.deviceId = deviceId;

    await modal.result
      .then(result => {
        if (result) {
          this.reloadDeviceList();
        }
      })
      .catch(() => false);
  }

  async openAddDeviceModal() {
    const modal = this.modalService.open(DeviceManagementCreateComponent, {
      size: 'sm',
      centered: true,
    });
    const success = await modal.result.catch(() => false);
    if (success) {
      await this.reloadDeviceList();
    }
  }

  private async reloadDeviceList() {
    this.reloadDeviceListSubject$.next(null);
  }
}
