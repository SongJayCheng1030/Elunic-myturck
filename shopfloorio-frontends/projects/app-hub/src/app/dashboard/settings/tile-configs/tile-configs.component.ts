import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '@sio/common';
import { ToastrService } from 'ngx-toastr';
import { TileConfigurationDto } from 'shared/common/models';

import { TileConfigurationService } from '../../shared/services/tile-configuration.service';

@Component({
  selector: 'app-tile-configs',
  templateUrl: './tile-configs.component.html',
  styleUrls: ['./tile-configs.component.scss'],
})
export class TileConfigsComponent implements OnInit {
  private logger = new Logger(`TileConfigsComponent`);

  @Input() set onSave(_: number) {
    this.logger.debug(`Save triggered`);
    this.setTileConfig();
  }

  setting = 'general';
  tileConfiguration: TileConfigurationDto[] | undefined;
  allowSaving = true;

  constructor(
    private tileConfigurationService: TileConfigurationService,
    private toastrService: ToastrService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.tileConfigurationService.getHttpTileConfigurations();
    this.tileConfigurationService.getTileConfigurations().subscribe(value => {
      this.tileConfiguration = (value || []).map(cfg => {
        if (!cfg.tileColor) {
          cfg.tileColor = '#ffffff';
        }

        if (!cfg.tileTextColor) {
          cfg.tileTextColor = '#000000';
        }
        return cfg;
      });
    });
  }

  setTileConfigValues(newValue: Partial<TileConfigurationDto>, id: number) {
    console.warn(22, newValue);

    if (!this.tileConfiguration) return;

    const tiles = [...this.tileConfiguration];
    if (tiles) {
      const tile = tiles.find(item => item.id === id);
      if (tile) {
        Object.keys(newValue).forEach(key => {
          if (tile)
            (tile[key as keyof TileConfigurationDto] as string | number) = newValue[
              key as keyof TileConfigurationDto
            ] as string | number;
        });
        this.tileConfigurationService.setTileConfigurations(tiles);
      }
    }
  }

  setTileConfig() {
    this.validateTiles();
    if (!this.allowSaving) {
      this.logger.info('Saving is not allowed!');

      this.toastrService.error(
        this.translateService.instant('MESSAGES.CHANGES_ARE_NOT_SAVED_DUE_TO_SOME_ERROR'),
        this.translateService.instant('MESSAGES.ERROR'),
      );
    }
    if (!this.tileConfiguration || !this.allowSaving) return;

    const tiles = [...this.tileConfiguration];
    tiles.forEach(tile => {
      if (this.tileConfigurationService.createdTiles.includes(tile.id)) {
        this.tileConfigurationService.createTile(tile, tile.id);
      } else
        this.tileConfigurationService.setTileConfiguration(tile.id, {
          ...tile,
        });
    });

    this.toastrService.success(
      this.translateService.instant('MESSAGES.CHANGES_SAVED'),
      this.translateService.instant('MESSAGES.SUCCESS'),
    );
  }

  deleteTile(id: number) {
    this.tileConfigurationService.deleteConfig(id);
  }

  changePosition(from: number, to: number) {
    if (!this.tileConfiguration) return;

    const tileConfiguration = this.tileConfiguration;

    const fromIndex = tileConfiguration.findIndex(item => item.id === from);
    const toIndex = tileConfiguration.findIndex(item => item.id === to);

    if ((!fromIndex && fromIndex !== 0) || (!toIndex && toIndex !== 0)) {
      return;
    }

    const fromEl = { ...tileConfiguration[fromIndex], order: tileConfiguration[toIndex].order };
    const toEl = { ...tileConfiguration[toIndex], order: tileConfiguration[fromIndex].order };

    tileConfiguration[fromIndex] = toEl;
    tileConfiguration[toIndex] = fromEl;

    this.tileConfigurationService.setTileConfigurations(tileConfiguration);
  }

  addTile() {
    this.tileConfigurationService.localCreateEmptyTileConfig();
  }

  private isHexColor(color: string) {
    return /^#[0-9A-F]{6,8}$/i.test(color);
  }

  private validateTileFields(tile: TileConfigurationDto) {
    const valid =
      !!tile.tileName &&
      this.isHexColor(tile.tileColor) &&
      this.isHexColor(tile.tileTextColor) &&
      !!tile.appUrl;

    if (!valid) {
      this.allowSaving = false;
    }

    this.logger.debug(`validateTiles: tile is ${valid ? 'valid' : 'INVALID'}`, tile);
    this.logger.debug(
      `tileName=`,
      !!tile.tileName,
      `tileColor=`,
      this.isHexColor(tile.tileColor),
      `textColor=`,
      this.isHexColor(tile.tileTextColor),
      `appUrl=`,
      !!tile.appUrl,
      tile,
    );

    return valid;
  }

  private validateTiles() {
    if (!this.tileConfiguration) {
      this.logger.debug(`validateTiles: no tile configuration`);
      return;
    }

    let result = true;
    const tiles = [...this.tileConfiguration];
    this.logger.debug(`Validating:`, tiles);
    tiles.forEach(tile => {
      // Skip over the rest if the first is invalid
      if (!result) {
        return;
      }

      const valid = this.validateTileFields(tile);
      if (!valid) {
        result = false;
      }
    });

    this.allowSaving = result;
  }
}
