import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EnvironmentService, TileConfigurationService } from '@sio/common';
import { TileConfigurationDto } from 'shared/common/models';

import { HubTitleService } from '../shared/services/hub-title.service';

@Component({
  selector: 'app-integrated-view',
  templateUrl: './integrated-view.component.html',
  styleUrls: ['./integrated-view.component.scss'],
})
export class IntegratedViewComponent implements OnInit {
  tile: TileConfigurationDto | null = null;

  constructor(
    private readonly environment: EnvironmentService,
    private readonly route: ActivatedRoute,
    private readonly tileConfigurationService: TileConfigurationService,
    private readonly hubTitleService: HubTitleService,
  ) {}

  ngOnInit(): void {
    this.environment.currentAppUrl = 'grafana';
    this.getTile();
  }

  ngOnDestroy(): void {
    this.hubTitleService.resetTitle();
  }

  async getTile(): Promise<void> {
    const id = this.route.snapshot.params['id'];
    this.tile = await this.tileConfigurationService.getHttpTileConfiguration(id);
    if (!this.tile) return;
    this.hubTitleService.setTitle(this.tile.tileName);
  }
}
