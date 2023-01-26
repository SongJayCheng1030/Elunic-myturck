import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TileConfigurationDto } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';

import { Logger } from '../util/logger';

@Injectable({
  providedIn: 'root',
})
export class SharedHubService {
  tiles = new BehaviorSubject<TileConfigurationDto[]>([]);
  tilesObservable = this.tiles.asObservable();
  private readonly logger: Logger = new Logger(`SharedHubService`);

  constructor(private readonly httpClient: HttpClient) {}

  getEndpointUrl(endpoint: string): string {
    return new URL(`/service/hub/${endpoint}`, window.location.origin).href;
  }

  setTiles(tiles: TileConfigurationDto[]) {
    this.tiles.next(tiles);
  }

  initTiles(): Observable<TileConfigurationDto[]> {
    return this.httpClient
      .get<DataResponse<TileConfigurationDto[]>>(this.getEndpointUrl('tile-configuration'))
      .pipe(
        catchError(error => {
          this.logger.error(`Cannot load tiles from hub:`, error);
          return of({ data: [] });
        }),
        map(resp => {
          const data = resp.data || [];
          this.setTiles(data);
          return data;
        }),
      );
  }

  open(link: string | URL | null): void {
    this.logger.info('open():', link);

    if (!link) {
      return;
    }

    // Convert the URL into a string
    // ---
    let plainLink = `${link || ''}`;
    if (link instanceof URL) {
      plainLink = link.href as string;
    }
    plainLink = plainLink.trim();

    if (!plainLink) {
      this.logger.info(`Nothing to open after string conversion: ${plainLink}`);
      return;
    }

    // Perform placeholder replacement
    // ---
    const fieldWhitelist = [
      'hash',
      'host',
      'hostname',
      'href',
      'origin',
      'pathname',
      'port',
      'protocol',
      'search',
    ];

    const replacedLink = plainLink.replace(/\$\{(.*?)\}/g, str => {
      if (str.length < 4) {
        return ''; // This is an empty substitution, aka. '${}'
      }

      const varName = str
        .substring(2, str.length - 1)
        .trim()
        .toLowerCase();
      if (!varName) {
        return '__ERR_INVALID_VAR__';
      }

      if (fieldWhitelist.includes(varName)) {
        // @ts-ignore
        return `${window.location[varName]}`;
      } else {
        return '__ERR_UNKNOWN_VAR__';
      }
    });
    this.logger.info(`Replaced link is:`, replacedLink);

    // Perform the actual redirect
    // ---
    const redirect = (url: string) => {
      this.logger.info(`Redirect to:`, url);
      window.location.href = url;
    };

    if (replacedLink.startsWith('//')) {
      redirect(`${window.location.protocol}:${replacedLink}`);
    } else if (replacedLink.startsWith('://')) {
      redirect(`${window.location.protocol}${replacedLink}`);
    } else if (replacedLink.startsWith('http')) {
      redirect(replacedLink);
    } else if (replacedLink.startsWith('/')) {
      redirect(new URL(replacedLink, window.location.origin).href);
    } else if (replacedLink.startsWith('/apps') || replacedLink.startsWith('apps/')) {
      redirect(new URL(replacedLink, window.location.origin).href);
    } else if (replacedLink.startsWith('/app') || replacedLink.startsWith('app/')) {
      redirect(new URL(replacedLink, window.location.origin).href);
    } else {
      this.logger.error(`Unknown how to handle:`, replacedLink, 'trying as relative URL');
      redirect(new URL(replacedLink, window.location.origin).href);
    }
  }
}
