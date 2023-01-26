import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthInfo } from 'shared/common/types';
import { Repository } from 'typeorm';

import { CreateTileConfiguration } from './dto/CreareTileConfiguration';
import { MULTITENANT_TILES } from './dto/defaults';
import { TileConfigurationEntity } from './tile-configuration.entity';

@Injectable()
export class TileConfigurationService {
  constructor(
    @InjectLogger(TileConfigurationService.name)
    private readonly logger: Logger,
    @InjectRepository(TileConfigurationEntity)
    private readonly tileConfigRepo: Repository<TileConfigurationEntity>,
  ) {}

  async getTileConfigurations(authInfo: AuthInfo): Promise<TileConfigurationEntity[]> {
    if (!authInfo.tenantId) {
      return MULTITENANT_TILES.map((t, id) => ({ ...t, id }));
    }

    const tiles = await this.tileConfigRepo.find({
      order: { order: 'ASC' },
      where: {
        tenantId: authInfo.tenantId,
      },
    });
    return tiles;
  }

  async getTileConfigurationById(
    authInfo: AuthInfo,
    id: string,
  ): Promise<TileConfigurationEntity | null> {
    const tile = await this.tileConfigRepo.findOne({
      where: {
        tenantId: authInfo.tenantId,
        id,
      },
    });
    return tile || null;
  }

  async createTileConfiguration(
    authInfo: AuthInfo,
    createData: CreateTileConfiguration,
  ): Promise<TileConfigurationEntity> {
    let order = createData.order;
    if (!createData.order) {
      const beforeElement = await this.tileConfigRepo.find({
        order: { order: 'DESC' },
        take: 1,
        where: {
          tenantId: authInfo.tenantId,
        },
      });
      if (!beforeElement.length) {
        order = 1;
      } else {
        order = beforeElement[0].order + 1;
      }
    }
    return await this.tileConfigRepo.save(
      {
        tileName: createData.tileName || '',
        desc: createData.desc || '',
        appUrl: createData.appUrl || '',
        iconUrl: createData.iconUrl || '',
        tileColor: createData.tileColor || '',
        tileTextColor: createData.tileTextColor || '',
        order,
        tenantId: authInfo.tenantId,
        show: createData.show === undefined || createData.show === null ? 1 : createData.show,
      },
      {
        reload: true,
      },
    );
  }

  async updateTileConfiguration(
    authInfo: AuthInfo,
    id: number,
    updateData: Partial<CreateTileConfiguration>,
  ): Promise<TileConfigurationEntity> {
    const tileConfiguration = await this.tileConfigRepo.findOne({
      id,
      tenantId: authInfo.tenantId,
    });
    if (!tileConfiguration) {
      throw new NotFoundException(`Tile Configuration ${id} not found`);
    }

    await this.tileConfigRepo.update({ id, tenantId: authInfo.tenantId }, updateData);

    const keys = Object.keys(updateData);

    keys.forEach(key => {
      (tileConfiguration[key as keyof TileConfigurationEntity] as string | number) = updateData[
        key as keyof CreateTileConfiguration
      ] as string | number;
    });

    return tileConfiguration;
  }

  async deleteTileConfiguration(authInfo: AuthInfo, id: number): Promise<boolean> {
    try {
      await this.tileConfigRepo.delete({ id, tenantId: authInfo.tenantId });
      return true;
    } catch (e) {
      this.logger.error(`Failed to delete tile:`, e);
      throw e;
    }
  }

  async changePosition(
    authInfo: AuthInfo,
    fromId: number,
    toId: number,
  ): Promise<TileConfigurationEntity> {
    const fromElement = await this.tileConfigRepo.findOne({
      id: fromId,
      tenantId: authInfo.tenantId,
    });
    const toElement = await this.tileConfigRepo.findOne({ id: toId, tenantId: authInfo.tenantId });

    if (!fromElement || !toElement) {
      throw new NotFoundException(
        `One of properties (or both) with ${fromId} or ${toId} id does not exist.`,
      );
    }

    await this.tileConfigRepo.update(
      { id: fromId, tenantId: authInfo.tenantId },
      { order: toElement.order },
    );
    await this.tileConfigRepo.update(
      { id: toId, tenantId: authInfo.tenantId },
      { order: fromElement.order },
    );

    const fromElementOrder = fromElement.order;
    fromElement.order = toElement.order;
    toElement.order = fromElementOrder;

    return fromElement;
  }
}
