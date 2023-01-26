import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedHubService } from '@sio/common';
import { TileConfigurationDto } from 'shared/common/models';

import { FileService } from '../../services/file.service';
import { TileConfigurationService } from '../../services/tile-configuration.service';

export interface CardData {
  title: string;
  desc?: string;
  img?: string;
}

@Component({
  selector: 'app-tile-card',
  templateUrl: './tile-card.component.html',
  styleUrls: ['./tile-card.component.scss'],
})
export class TileCardComponent implements OnInit {
  @Input() mode: 'preview' | '' = '';
  @Input() config: TileConfigurationDto | undefined;

  baseUrl = `${location.origin}/`;

  constructor(
    private fileService: FileService,
    private tileConfigurationService: TileConfigurationService,
    private readonly sharedHubService: SharedHubService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {}

  get anchorTarget(): string {
    return this.config &&
      (this.config.appUrl.includes('http://') || this.config.appUrl.includes('https://'))
      ? '_blank'
      : '';
  }

  open(event: Event, input: HTMLInputElement): boolean {
    event.preventDefault();

    if (this.mode === 'preview') {
      event.preventDefault();
      event.stopImmediatePropagation();
      input.click();
      return false;
    }

    if (!this.config) {
      return false;
    }

    // Open in frame
    if (this.config.integratedView === true) {
      this.router.navigate(['integrated-tile-view', this.config.id]);
      return false;
    }

    this.sharedHubService.open(this.config.appUrl);
    event.preventDefault();
    event.stopImmediatePropagation();
    return false;
  }

  async toggleVisibility() {
    if (this.config) {
      await this.tileConfigurationService.setTileConfiguration(this.config.id, {
        show: this.config.show === 1 ? 0 : 1,
      });
    }
  }

  async customEventHandler(files: File[] | FileList) {
    const file = await this.fileService.uploadFile(files[0]);
    if (this.config && file) {
      await this.tileConfigurationService.setTileConfiguration(this.config.id, {
        iconUrl: file.id,
      });
    }
  }
}
