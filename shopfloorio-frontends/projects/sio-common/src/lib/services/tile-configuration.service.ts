import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CreateTileConfigurationDto, TileConfigurationDto } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';

import { HubService } from '../services';
import { EnvironmentService } from '.';

@Injectable({
  providedIn: 'root',
})
export class TileConfigurationService {
  tileConfiguration = new BehaviorSubject<TileConfigurationDto[]>([]);
  createdTiles: number[] = [];

  constructor(
    private http: HttpClient,
    private hubService: HubService,
    private readonly environment: EnvironmentService,
  ) {}

  setTileConfigurations(newConfigs: TileConfigurationDto[]): void {
    this.tileConfiguration.next(newConfigs);
    this.hubService.setTiles(newConfigs);
  }

  getTileConfigurations(): Observable<TileConfigurationDto[]> {
    return this.tileConfiguration;
  }

  getEndpointUrl(endpoint: string): string {
    return urlJoin(this.environment.hubServiceUrl, endpoint);
  }

  async setTileConfiguration(id: number, newConfig: Partial<TileConfigurationDto>): Promise<void> {
    const { data } = (await this.http
      .put<DataResponse<TileConfigurationDto>>(this.getEndpointUrl(`tile-configuration/${id}`), {
        ...newConfig,
      })
      .toPromise()) as DataResponse<TileConfigurationDto>;

    const tileConfiguration = this.tileConfiguration.value;
    const config = tileConfiguration.find(item => item.id === id) as TileConfigurationDto;

    const keys = Object.keys(data);

    for (const key of keys) {
      (config[key as keyof TileConfigurationDto] as string | number) = data[
        key as keyof TileConfigurationDto
      ] as string | number;
    }

    this.setTileConfigurations(tileConfiguration);
  }

  async deleteConfig(id: number): Promise<void> {
    await this.http.delete(this.getEndpointUrl(`tile-configuration/${id}`)).toPromise();
    this.setTileConfigurations(this.tileConfiguration.value.filter(item => item.id !== id));
  }

  async changePosition(from: number, to: number): Promise<void> {
    await this.http
      .put(this.getEndpointUrl('tile-configuration/change-position'), {
        fromId: from,
        toId: to,
      })
      .toPromise();

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

  async getHttpTileConfigurations(): Promise<void> {
    const { data } = (await this.http
      .get<DataResponse<TileConfigurationDto[]>>(this.getEndpointUrl('tile-configuration'))
      .toPromise()) as DataResponse<TileConfigurationDto[]>;
    this.setTileConfigurations(data);
  }

  async createEmptyTileConfigurations(): Promise<void> {
    const tileConfiguration = this.tileConfiguration.value;
    const { data } = (await this.http
      .post<DataResponse<TileConfigurationDto>>(this.getEndpointUrl('tile-configuration'), {})
      .toPromise()) as DataResponse<TileConfigurationDto>;
    tileConfiguration.push(data);
    this.setTileConfigurations(tileConfiguration);
  }

  localCreateEmptyTileConfig(): void {
    const tileConfiguration = this.tileConfiguration.value;
    // the last element by order
    const lastTile = tileConfiguration[tileConfiguration.length - 1];
    const tile: TileConfigurationDto = {
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

  async createTile(tile: CreateTileConfigurationDto, id?: number): Promise<void> {
    const { data } = (await this.http
      .post<DataResponse<TileConfigurationDto>>(this.getEndpointUrl('tile-configuration'), tile)
      .toPromise()) as DataResponse<TileConfigurationDto>;

    if (id) {
      this.localTileUpdate(id, data);
      return;
    }

    const tileConfiguration = this.tileConfiguration.value;
    tileConfiguration.push(data);
    this.setTileConfigurations(tileConfiguration);
  }

  localTileUpdate(id: number, data: Partial<TileConfigurationDto>): void {
    const tileConfiguration = [...this.tileConfiguration.getValue()];
    const tile = tileConfiguration.find(t => t.id === id);

    if (!tile) return;

    for (const key in data) {
      if (key !== 'id') {
        (tile[key as keyof TileConfigurationDto] as string | number) = data[
          key as keyof TileConfigurationDto
        ] as string | number;
      }
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

  async getHttpTileConfiguration(id: string) {
    const configuration: DataResponse<TileConfigurationDto> = (await this.http
      .get<DataResponse<TileConfigurationDto>>(this.getEndpointUrl(`tile-configuration/${id}`))
      .toPromise()) as DataResponse<TileConfigurationDto>;
    return configuration.data || null;
  }
}
