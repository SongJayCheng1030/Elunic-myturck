import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@rewiko/crud-typeorm';
import { AuthInfo } from 'shared/common/types';
import { Connection, Repository } from 'typeorm';

import { AssetEntity } from '../asset/asset.entity';
import { AssetImageMapEntity } from './asset-image-map.entity';
import { AssetImageMapItemEntity } from './asset-image-map-item.entity';
import { CreateImageMapClassDto } from './dto/CreateAssetImageMapDto';

@Injectable()
export class AssetImageMapService extends TypeOrmCrudService<AssetImageMapEntity> {
  constructor(
    @InjectRepository(AssetImageMapEntity)
    public assetImageMapEntityRepo: Repository<AssetImageMapEntity>,
    @InjectRepository(AssetImageMapItemEntity)
    public assetImageMapItemEntityRepo: Repository<AssetImageMapItemEntity>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(assetImageMapEntityRepo);
  }

  /**
   * Creates an new image map with the data provided via the `dto`.
   * @param authInfo The `AuthInfo` object to limit the actions
   * @param dto The update data
   * @returns The created image map or throws an exception in any
   * case of an error
   */
  async createAssetImageMap(
    authInfo: AuthInfo,
    dto: CreateImageMapClassDto,
  ): Promise<AssetImageMapEntity> {
    const id = await this.connection.transaction(async entityManager => {
      const imageMapRepo = entityManager.getRepository(AssetImageMapEntity);

      const newOne = imageMapRepo.create(dto);
      await imageMapRepo.save(newOne, { reload: true });
      return newOne.id;
    });

    return this.getImageMapByIdOrThrow(id);
  }

  async setImageMapToAsset(assetId: string, imageMapId?: string): Promise<void> {
    await this.connection.transaction(async entityManager => {
      let imageMap = null;
      if (imageMapId) {
        imageMap = await this.getImageMapByIdOrThrow(imageMapId);
      }
      const assetEntityRepo = entityManager.getRepository(AssetEntity);
      const asset = await assetEntityRepo.findOneOrFail({ id: assetId });
      asset.imageMap = imageMap;
      await assetEntityRepo.save(asset, { reload: true });
    });
  }

  /**
   * Fetches an imageId by id and for the indicated tenant and
   * either throws an exception or returns it
   * @param id The id of the imageMapId to fetch
   */
  async getImageMapByIdOrThrow(id: string): Promise<AssetImageMapEntity> {
    const imageMap = await this.assetImageMapEntityRepo.findOne({ id });
    if (!imageMap) {
      throw new NotFoundException(`No such image map`);
    }
    return imageMap;
  }

  /**
   * Deletes an image map by id and for the indicated tenant and
   * either throws an exception or deletes it
   *
   * @param id The id of the image map to delete
   */
  async softDeleteById(id: string): Promise<void> {
    const imageMap = await this.assetImageMapEntityRepo.findOne({ id });
    if (!id || !imageMap) {
      throw new NotFoundException(`No such image map`);
    }
    await this.assetImageMapEntityRepo.softDelete({ id });
  }
}
