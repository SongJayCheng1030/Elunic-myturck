import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@rewiko/crud-typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';

import { AssetService } from '../asset/asset.service';
import { AssetGroupEntity } from './asset-group.entity';
import { CreateUpdateAssetGroupDtoRequest } from './dto/CreateAssetGroupDtoRequest';

@Injectable()
export class AssetGroupService extends TypeOrmCrudService<AssetGroupEntity> {
  constructor(
    @InjectRepository(AssetGroupEntity)
    private assetGroupEntityRepo: Repository<AssetGroupEntity>,
    private assetService: AssetService,
  ) {
    super(assetGroupEntityRepo);
  }
  async removeAsset(groupId: string, assetId: string) {
    const group = await this.assetGroupEntityRepo.findOne(groupId, { relations: ['assets'] });
    if (!group) throw new NotFoundException(`Assetgroup with id ${groupId} does not exist.`);
    const asset = await this.assetService.findOne(assetId);
    if (!asset) throw new NotFoundException(`Asset with id ${assetId} does not exist.`);

    group.assets = group.assets.filter(a => a.id !== assetId);
    return await this.assetGroupEntityRepo.save(group);
  }
  async addAsset(groupId: string, assetId: string) {
    const group = await this.assetGroupEntityRepo.findOne(groupId, { relations: ['assets'] });
    if (!group) throw new NotFoundException(`Assetgroup with id ${groupId} does not exist.`);
    const asset = await this.assetService.findOne(assetId);
    if (!asset) throw new NotFoundException(`Asset with id ${assetId} does not exist.`);

    group.assets.push(asset);
    return await this.assetGroupEntityRepo.save(group);
  }
  async create(rawRequest: Request, dto: CreateUpdateAssetGroupDtoRequest) {
    return await this.assetGroupEntityRepo.save({
      ...dto,
      tenantId: rawRequest.auth.tenantId,
    });
  }
  async update(rawRequest: Request, id: string, dto: Partial<CreateUpdateAssetGroupDtoRequest>) {
    const exists = await this.assetGroupEntityRepo.findOne(id, { relations: ['assets'] });
    if (!exists) {
      throw new NotFoundException();
    }

    return await this.assetGroupEntityRepo.save(
      {
        ...exists,
        ...dto,
        id,
        tenantId: rawRequest.auth.tenantId,
      },
      { reload: true },
    );
  }
}
