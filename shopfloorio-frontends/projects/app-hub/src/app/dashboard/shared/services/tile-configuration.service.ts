import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SharedHubService, SharedSessionService } from '@sio/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { CreateTileConfigurationDto, TileConfigurationDto } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';

@Injectable({
  providedIn: 'root',
})
export class TileConfigurationService {
  tileConfiguration = new BehaviorSubject<TileConfigurationDto[]>([]);
  createdTiles: number[] = [];

  constructor(
    private apiService: SharedSessionService,
    private sharedHubService: SharedHubService,
  ) {}

  setTileConfigurations(newConfigs: TileConfigurationDto[]) {
    this.tileConfiguration.next(newConfigs);
    this.sharedHubService.setTiles(newConfigs);
  }

  getTileConfigurations(): Observable<TileConfigurationDto[]> {
    return this.tileConfiguration;
  }

  getEndpointUrl(endpoint: string): string {
    return new URL(`/service/hub/${endpoint}`, window.location.origin).href;
  }

  async setTileConfiguration(id: number, newConfig: Partial<TileConfigurationDto>) {
    const updatedItem: HttpResponse<DataResponse<TileConfigurationDto> | null> =
      await this.apiService.put(this.getEndpointUrl(`tile-configuration/${id}`), {
        ...newConfig,
      });

    const tileConfiguration = this.tileConfiguration.value;
    const config = tileConfiguration.find(item => item.id === id);
    if (!config || !updatedItem.body) return;
    const keys = Object.keys(updatedItem.body.data);

    for (const key of keys) {
      (config[key as keyof TileConfigurationDto] as string | number) = updatedItem.body.data[
        key as keyof TileConfigurationDto
      ] as string | number;
    }

    this.setTileConfigurations(tileConfiguration);
  }

  async deleteConfig(id: number) {
    await this.apiService.delete(this.getEndpointUrl(`tile-configuration/${id}`));
    this.setTileConfigurations(this.tileConfiguration.value.filter(item => item.id !== id));
  }

  async changePosition(from: number, to: number) {
    await this.apiService.put(this.getEndpointUrl('tile-configuration/change-position'), {
      fromId: from,
      toId: to,
    });

    const tileConfiguration = this.tileConfiguration.value;

    const fromIndex = tileConfiguration.findIndex(item => item.id === from);
    const toIndex = tileConfiguration.findIndex(item => item.id === to);

    if ((!fromIndex && fromIndex !== 0) || (!toIndex && toIndex !== 0)) {
      return;
    }

    const fromEl = { ...tileConfiguration[fromIndex] };

    tileConfiguration[fromIndex] = { ...tileConfiguration[toIndex] };
    tileConfiguration[toIndex] = fromEl;

    this.setTileConfigurations([...tileConfiguration]);
  }

  async getHttpTileConfigurations() {
    const configuration: HttpResponse<DataResponse<TileConfigurationDto[]> | null> =
      await this.apiService.get(this.getEndpointUrl('tile-configuration'));
    this.setTileConfigurations(configuration.body?.data || []);
  }

  async createEmptyTileConfigurations() {
    const tileConfiguration = this.tileConfiguration.value;
    const configuration: HttpResponse<DataResponse<TileConfigurationDto> | null> =
      await this.apiService.post(this.getEndpointUrl('tile-configuration'), {});
    if (!configuration.body) return;
    tileConfiguration.push({
      appUrl: configuration.body.data.appUrl,
      desc: configuration.body.data.desc,
      iconUrl: configuration.body.data.iconUrl,
      id: configuration.body.data.id,
      tileColor: configuration.body.data.tileColor,
      tileName: configuration.body.data.tileName,
      tileTextColor: configuration.body.data.tileTextColor,
      order: configuration.body.data.order,
      show: configuration.body.data.show,
      integratedView: configuration.body.data.integratedView,
    });
    this.setTileConfigurations(tileConfiguration);
  }

  localCreateEmptyTileConfig() {
    const tileConfiguration = this.tileConfiguration.value;
    // the last element by order
    const lastTile = tileConfiguration[tileConfiguration.length - 1];
    const tile = {
      id: this.getRandomNumber(),
      appUrl: '',
      desc: '',
      iconUrl: '',
      order: 1,
      show: 1,
      tileColor: '#ffffff',
      tileName: '',
      tileTextColor: '#000000',
      integratedView: false,
    };

    if (lastTile) {
      tile.order = lastTile.order + 1;
    }

    tileConfiguration.push(tile);
    this.setTileConfigurations(tileConfiguration);
    this.createdTiles.push(tile.id);
  }

  async createTile(tile: CreateTileConfigurationDto, id?: number) {
    const configuration: HttpResponse<DataResponse<TileConfigurationDto> | null> =
      await this.apiService.post(this.getEndpointUrl('tile-configuration'), tile);
    if (!configuration.body) return;

    if (id) {
      this.localTileUpdate(id, configuration.body.data);
      return;
    }

    const tileConfiguration = this.tileConfiguration.value;
    tileConfiguration.push({
      appUrl: configuration.body.data.appUrl,
      desc: configuration.body.data.desc,
      iconUrl: configuration.body.data.iconUrl,
      id: configuration.body.data.id,
      tileColor: configuration.body.data.tileColor,
      tileName: configuration.body.data.tileName,
      tileTextColor: configuration.body.data.tileTextColor,
      order: configuration.body.data.order,
      show: configuration.body.data.show,
      integratedView: configuration.body.data.integratedView,
    });
    this.setTileConfigurations(tileConfiguration);
  }

  localTileUpdate(id: number, data: Partial<TileConfigurationDto>) {
    const tileConfiguration = [...this.tileConfiguration.getValue()];
    const tile = tileConfiguration.find(t => t.id === id);

    if (!tile) return;

    for (const key in data) {
      if (key !== 'id')
        (tile[key as keyof TileConfigurationDto] as string | number) = data[
          key as keyof TileConfigurationDto
        ] as string | number;
    }

    this.setTileConfigurations(tileConfiguration);
  }

  getRandomNumber(): number {
    const ids = this.tileConfiguration.getValue().map(t => t.id);
    const result = Math.floor(Math.random() * 1000);

    // generate random value again if such id already exists
    if (ids.includes(result)) {
      return this.getRandomNumber();
    }
    return result;
  }
}
