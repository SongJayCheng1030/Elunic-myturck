import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { get, has } from 'lodash';
import { AuthInfo } from 'shared/common/types';
import { SharedFileService, TenantMigration } from 'shared/nestjs';
import { Connection } from 'typeorm';

import { TileConfigurationEntity } from '../tile-configuration/tile-configuration.entity';
import { InitialTiles, TileIconData, TileIconDataMimeType } from './initial-tiles';

@Injectable()
export class TenantMigrationCreateInitialHubTiles001 implements TenantMigration {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly fileService: SharedFileService,
  ) {}

  async getName(): Promise<string> {
    return '001-CreateInitialHubTiles';
  }

  async up(tenantId: string, authInfo: AuthInfo): Promise<void> {
    await this.connection.transaction(async em => {
      const repo = em.getRepository<TileConfigurationEntity>(TileConfigurationEntity);

      for (const tile of InitialTiles) {
        // If there is an icon, we upload it
        let iconUrl = '';
        if (tile.iconUrl && has(TileIconData, tile.iconUrl)) {
          const base64Data = get(TileIconData, tile.iconUrl);
          const mimeType = get(TileIconDataMimeType, tile.iconUrl, 'application/octet-stream');

          const file = await this.fileService.uploadFileByBuffer(
            authInfo,
            Buffer.from(base64Data, 'base64'),
            'icon.svg',
            mimeType,
          );

          iconUrl = file.id;
        } else {
          // No such file
        }

        const entity = await repo.create({
          desc: '',
          ...tile,
          iconUrl,
          tenantId,
        });

        await repo.save(entity);
      }
    });
  }
}
