import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EnvironmentService, Logger } from '@sio/common';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';

import {
  GeneralConfiguration,
  GeneralConfigurationService,
} from '../shared/services/general-configuration.service';
import { TileConfigurationService } from '../shared/services/tile-configuration.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  private logger = new Logger(`SettingsComponent`);

  setting = 'general';
  generalConfiguration: GeneralConfiguration[] | undefined;

  private saveTilesSubject = new Subject<number>();

  constructor(
    private readonly environment: EnvironmentService,
    private readonly generalConfigurationService: GeneralConfigurationService,
    private readonly tileConfigurationService: TileConfigurationService,
    private readonly toastrService: ToastrService,
    private readonly translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.environment.currentAppUrl = 'hub';
    this.tileConfigurationService.getHttpTileConfigurations();
    this.generalConfigurationService.getGeneralConfiguration().subscribe(value => {
      if (!value) {
        this.generalConfigurationService.getHttpGeneralConfiguration();
      }
      this.generalConfiguration = value;
    });
  }

  setConfigValues(newValue: Partial<GeneralConfiguration>) {
    const configs = this.generalConfiguration;
    if (configs) {
      const config = configs.find(item => item.key === newValue.key);
      if (config) {
        config.value = newValue.value;
        this.generalConfiguration = configs;
      }
    }
  }

  async setGeneralConfiguration() {
    if (!this.generalConfiguration) {
      return;
    }

    try {
      await this.generalConfigurationService.updateHttpGeneralConfiguration(
        this.generalConfiguration,
      );
      this.toastrService.success(
        this.translateService.instant('MESSAGES.CHANGES_SAVED'),
        this.translateService.instant('MESSAGES.SUCCESS'),
      );
    } catch (ex) {
      this.logger.error(`Failed to save general config:`, ex);
      this.toastrService.error(
        this.translateService.instant('MESSAGES.CHANGES_ARE_NOT_SAVED_DUE_TO_SOME_ERROR'),
        this.translateService.instant('MESSAGES.ERROR'),
      );
    }
  }

  addTile() {
    this.tileConfigurationService.localCreateEmptyTileConfig();
  }

  saveTiles() {
    this.saveTilesSubject.next(Date.now());
  }

  get saveTiles$(): Observable<number> {
    return this.saveTilesSubject;
  }

  get primaryColor() {
    return this.generalConfigurationService.getProperty('primaryColor')?.value;
  }

  get bgColor() {
    return this.generalConfigurationService.getProperty('bgColor')?.value;
  }

  get light() {
    return this.generalConfigurationService.getProperty('light')?.value;
  }

  get bgImage() {
    return this.generalConfigurationService.getProperty('bgImage')?.value as string;
  }

  get logoImage() {
    return this.generalConfigurationService.getProperty('logoImage')?.value as string;
  }
}
