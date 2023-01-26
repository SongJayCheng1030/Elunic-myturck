import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { AuthInfo } from 'shared/common/types';
import { SharedFileService, TenantMigration } from 'shared/nestjs';
import { Connection, Repository } from 'typeorm';

import { GeneralEntity } from '../general/general.entity';
import { HubBackgroundImage } from './background-image';

@Injectable()
export class TenantMigrationCreateHubBackground002 implements TenantMigration {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly fileService: SharedFileService,
  ) {}

  async getName(): Promise<string> {
    return '002-CreateHubBackground';
  }

  async up(tenantId: string, authInfo: AuthInfo): Promise<void> {
    await this.connection.transaction(async em => {
      const repo = em.getRepository<GeneralEntity>(GeneralEntity);

      const file = await this.fileService.uploadFileByBuffer(
        authInfo,
        Buffer.from(HubBackgroundImage, 'base64'),
        'background.jpg',
        'image/jpg',
      );

      await this.setHubSetting('bgImage', file.id, tenantId, repo);
      await this.setHubSetting('primaryColor', '#007bb6', tenantId, repo);
      await this.setHubSetting('bgColor', 'rgba(239,239,239,0)', tenantId, repo);
      await this.setHubSetting('light', 1, tenantId, repo);
    });
  }

  private async setHubSetting(
    key: string,
    value: string | number,
    tenantId: string,
    repo: Repository<GeneralEntity>,
  ) {
    const exists = await repo.findOne({
      where: {
        key,
        tenantId,
      },
    });

    if (exists) {
      exists.value = `${value}`;
      await repo.save(exists);
    } else {
      const entity = await repo.create({
        key,
        value: `${value}`,
        tenantId,
      });
      await repo.save(entity);
    }
  }
}
