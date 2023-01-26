import { Component, OnInit } from '@angular/core';
import { ConfigManagementService, EnvironmentService, Settings } from '@sio/common';
import { cloneDeep, orderBy } from 'lodash';

@Component({
  selector: 'app-config-management',
  templateUrl: './config-management.component.html',
  styleUrls: ['./config-management.component.scss'],
})
export class ConfigManagementComponent implements OnInit {
  settingsOrigin: Settings[] = [];
  settings: Settings[] = [];
  sortOrder: 'asc' | 'desc' = 'desc';
  goalKeys = ['OEE_YIELD_GOAL', 'OEE_UTILIZATION_GOAL', 'OEE_KPI_GOAL', 'OEE_AVAILABILITY_GOAL'];
  goalMin = 0;
  goalMax = 100;

  constructor(
    private readonly configManagementService: ConfigManagementService,
    private readonly environment: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.environment.currentAppUrl = 'condition-monitoring/#/config-management';
    this.configManagementService.getSettings().subscribe(data => {
      this.settingsOrigin = cloneDeep(data);
      this.settings = orderBy(data, 'key', this.sortOrder);
    });
  }

  onSubmit() {
    if (this.isSettingsValid) {
      this.settings.forEach(entry => {
        const config = this.settingsOrigin.find(origin => origin.key === entry.key);
        if (config && config.value !== entry.value) {
          this.configManagementService.cachedSettings = null;
          this.configManagementService.updateSettings(entry.key, entry.value).subscribe();
        }
      });
      this.settingsOrigin = cloneDeep(this.settings);
    }
  }

  onSort() {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
    this.settings = orderBy(this.settings, 'key', this.sortOrder);
  }

  isValid(settings: Settings): boolean {
    const value =
      Number(settings.value) || Number(settings.value) === 0 ? Number(settings.value) : -1;
    if (!(settings.value || settings.value === '0' || settings.value === 0) || value === -1) {
      return false;
    }
    if (this.goalKeys.indexOf(settings.key) !== -1) {
      return value <= this.goalMax && value >= this.goalMin;
    }
    return true;
  }

  get isSettingsValid(): boolean {
    let valid = true;
    this.settings?.forEach(config => {
      if (!this.isValid(config)) {
        valid = false;
      }
    });
    return valid;
  }
}
