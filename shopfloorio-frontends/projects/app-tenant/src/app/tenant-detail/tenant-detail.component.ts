import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent, TenantService } from '@sio/common';
import { get, update } from 'lodash';
import { firstValueFrom } from 'rxjs';
import {
  GroupDto,
  MAINTENANCE_INTERVAL_CALCULATION_SETTING_KEY,
  MAINTENANCE_INTERVAL_SETTING,
  TenantDto,
  TENANT_DEVICE_GROUP_SETTING_KEY,
} from 'shared/common/models';

import { TenantSettingsService } from '../../services/tenant-settings.service';

interface ActionMode {
  [key: string]: 'disabled' | 'enabled';
}

interface Setting {
  name: string;
  key: string;
  value: string | null;
  type?: string;
  mode: 'disabled' | 'enabled';
  immutable?: boolean;
  options?: Array<{ name: string; value: string }>;
  disableActions?: boolean;
  confirmModal?: any;
}

@Component({
  selector: 'app-tenant-detail',
  templateUrl: './tenant-detail.component.html',
  styleUrls: ['./tenant-detail.component.scss'],
})
export class TenantDetailComponent implements OnInit {
  tenant: TenantDto | undefined;
  actionMode: ActionMode = {
    tenantName: 'disabled',
  };
  settings: Setting[] = [
    {
      name: 'TENANT_DETAIL.MAINTENANCE_MANAGER_INTERVAL_CALCULATION',
      key: MAINTENANCE_INTERVAL_CALCULATION_SETTING_KEY,
      value: null,
      type: 'select',
      mode: 'disabled',
      options: [
        {
          name: 'TENANT_SETTINGS.ON_EXECUTION',
          value: MAINTENANCE_INTERVAL_SETTING.ON_EXECUTION,
        },
        {
          name: 'TENANT_SETTINGS.STRICT_BY_INTERVAL',
          value: MAINTENANCE_INTERVAL_SETTING.STRICT_INTERVAL,
        },
      ],
    },
    {
      name: 'TENANT_DETAIL.CUMULOCITY_GROUP',
      key: TENANT_DEVICE_GROUP_SETTING_KEY,
      value: null,
      type: 'select',
      mode: 'disabled',
      immutable: true,
      confirmModal: {
        title: 'MODALS.IMMUTABLE_CONFIRM.TITLE',
        body: 'MODALS.IMMUTABLE_CONFIRM.BODY',
        confirm: 'MODALS.IMMUTABLE_CONFIRM.CONFIRM',
        abort: 'MODALS.IMMUTABLE_CONFIRM.ABORT',
      },
    },
  ];

  constructor(
    private modalService: NgbModal,
    private activeRoute: ActivatedRoute,
    private tenantSettingsService: TenantSettingsService,
    private tenantService: TenantService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.activeRoute.params.pipe().subscribe(async items => {
      if (items.tenantId && items.tenantId !== 'create') {
        const tenant = await this.tenantService.getTenantById(items.tenantId);
        this.tenant = tenant;
        this.settings.forEach(async setting => {
          setting.value =
            this.tenant?.tenantSettings?.find(entry => entry.key === setting.key)?.value || null;
          if (setting.immutable && setting.value) {
            setting.disableActions = true;
          }
          if (setting.key === TENANT_DEVICE_GROUP_SETTING_KEY) {
            const deviceGroups = await this.getDeviceGroupOptions(items.tenantId, !!setting.value);
            setting.options = deviceGroups?.map(group => ({
              name: group.name,
              value: group.id,
            }));
          }
        });
      } else {
        this.tenant = {
          id: '',
          name: '',
          ownerId: '',
          status: false,
          updatedAt: '',
        };
      }
    });
  }

  isActionModeEnabled(path: string) {
    return get(this.actionMode, path) === 'enabled';
  }

  toggleActionMode(path: string) {
    if (get(this.actionMode, path)) {
      update(this.actionMode, path, () =>
        this.isActionModeEnabled(path) ? 'disabled' : 'enabled',
      );
    }
  }

  toggleSettingMode(setting: Setting) {
    setting.mode = setting.mode === 'enabled' ? 'disabled' : 'enabled';
  }

  async saveSetting(setting: Setting) {
    if (this.tenant?.id && setting.value) {
      if (setting.confirmModal) {
        const confirmed = await this.openConfirmModal(setting);
        if (!confirmed) {
          return;
        }
      }
      await this.tenantService.updateTenantSettingsByKey(
        this.tenant.id,
        setting.key,
        setting.value,
      );
      this.toggleSettingMode(setting);
      if (setting.immutable) {
        setting.disableActions = true;
      }
    }
  }

  async deleteTenant() {
    if (this.tenant) {
      await this.tenantService.deleteTenantById(this.tenant.id);
      await this.tenantService.getHttpTenants();
      this.router.navigate(['/']);
    }
  }

  async saveTenant() {
    if (!this.tenant) return;
    if (this.tenant.id) {
      await this.tenantService.updateTenantById(this.tenant.id, this.tenant);
      this.toggleActionMode('tenantName');
    } else {
      await this.tenantService.createTenant(this.tenant);
      this.router.navigate(['/']);
    }
  }

  private openConfirmModal(setting: Setting): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });
    modal.componentInstance.content = setting.confirmModal;
    return modal.result;
  }

  private async getDeviceGroupOptions(tenantId: string, hasGroupId: boolean): Promise<GroupDto[]> {
    if (hasGroupId) {
      const group = await firstValueFrom(this.tenantSettingsService.getGroupByTenantId(tenantId));
      return [group];
    }
    return firstValueFrom(this.tenantSettingsService.getAvailableGroups());
  }
}
