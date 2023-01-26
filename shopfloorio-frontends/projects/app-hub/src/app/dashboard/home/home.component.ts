import { Component, OnInit } from '@angular/core';
import { EnvironmentService, SharedHubService, SharedSessionService } from '@sio/common';
import { TileConfigurationDto } from 'shared/common/models';

import {
  GeneralConfiguration,
  GeneralConfigurationService,
} from '../shared/services/general-configuration.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  generalConfiguration: GeneralConfiguration[] = [];
  cards: TileConfigurationDto[] = [];
  mode = '';
  username = '';

  constructor(
    private readonly environment: EnvironmentService,
    private readonly generalConfigurationService: GeneralConfigurationService,
    private readonly sharedSessionService: SharedSessionService,
    private readonly sharedHubService: SharedHubService,
  ) {}

  ngOnInit(): void {
    this.environment.currentAppUrl = 'hub';
    this.username = this.sharedSessionService.userName;
    this.generalConfigurationService.getGeneralConfiguration().subscribe(value => {
      this.generalConfiguration = value;
    });
    this.sharedHubService.tilesObservable.subscribe(value => {
      if (value) {
        this.cards = value.filter(entry => entry.show);
      }
      this.getViewTileMode();
    });
  }

  get bgColor() {
    const bgColor = this.generalConfigurationService.getProperty('bgColor');
    return bgColor?.value || '';
  }

  get light() {
    const light = this.generalConfigurationService.getProperty('light');
    return light?.value || '';
  }

  getViewTileMode() {
    switch (this.cards.length) {
      case 1:
        this.mode = '1x1';
        break;
      case 2:
        this.mode = '1x2';
        break;
      case 3:
      case 4:
        this.mode = '2x2';
        break;
      case 5:
      case 6:
        this.mode = '2x3';
        break;
      case 7:
      case 8:
        this.mode = '2x4';
        break;
      default:
        this.mode = '2x5';
        break;
    }
  }
}
