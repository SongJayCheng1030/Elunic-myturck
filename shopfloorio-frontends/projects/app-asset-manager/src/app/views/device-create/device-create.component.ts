import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DevicesService } from '@sio/common';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-device-management-create',
  templateUrl: './device-create.component.html',
  styleUrls: ['./device-create.component.scss'],
})
export class DeviceManagementCreateComponent implements OnInit {
  devices: string[] = [];
  deviceLoading = false;
  form = new FormGroup({ deviceId: new FormControl(null, Validators.required) });

  constructor(
    public activeModal: NgbActiveModal,
    private deviceService: DevicesService,
    private readonly toastService: ToastrService,
    private readonly router: Router,
    private readonly translateService: TranslateService,
  ) {}

  async ngOnInit() {
    this.deviceLoading = true;
    this.devices = await lastValueFrom(this.deviceService.getDeviceIds());
    this.deviceLoading = false;
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

    try {
      await this.deviceService.createDevice(this.form.value.deviceId);
      this.toastService.success(this.translateService.instant('MESSAGES.DEVICE_REGISTERED'));
      this.activeModal.close(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.error?.message;
      this.activeModal.close(false);
      this.toastService.error(
        this.translateService.instant(message || 'ERRORS.BACKEND_ERROR_MESSAGE'),
      );
    }
    this.goToManagementDevice();
  }
}
