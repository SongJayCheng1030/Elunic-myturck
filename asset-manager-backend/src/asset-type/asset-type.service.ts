import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@rewiko/crud-typeorm';
import { get, omit, set } from 'lodash';
import * as NodeCache from 'node-cache';
import { AuthInfo } from 'shared/common/types';
import { Connection, EntityManager, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { AssetHierarchyBuilder } from '../asset-hierarchy/asset-hierarchy-builder';
import { AssetPropertyDefinitionEntity } from '../asset-property/asset-property-definition.entity';
import { AssetPropertyValueEntity } from '../asset-property/asset-property-value.entity';
import {
  ASSET_TYPE_CACHING,
  BUILTIN_GENERIC_ASSET_TYPE_EQUIPMENT_TYPE,
  BUILTIN_GENERIC_ASSET_TYPE_NAME,
} from '../definitions';
import { AssetTypeEntity } from './asset-type.entity';
import { CreateAssetTypeDto } from './dto/CreateAssetTypeDto';
import { UpdateAssetTypeClassDto } from './dto/UpdateAssetTypeDto';

@Injectable()
export class AssetTypeService extends TypeOrmCrudService<AssetTypeEntity> {
  private dataCache: NodeCache;

  constructor(
    @InjectRepository(AssetTypeEntity)
    public assetTypeEntityRepo: Repository<AssetTypeEntity>,
    @InjectRepository(AssetPropertyDefinitionEntity)
    private readonly propDefEntityRepo: Repository<AssetPropertyDefinitionEntity>,
    @InjectRepository(AssetPropertyValueEntity)
    private readonly propValEntityRepo: Repository<AssetPropertyValueEntity>,
    @InjectConnection()
    private readonly connection: Connection,
    @InjectLogger(AssetTypeService.name)
    private readonly logger: Logger,
  ) {
    super(assetTypeEntityRepo);
    this.dataCache = new NodeCache({ stdTTL: ASSET_TYPE_CACHING / 1000 });
  }

  /**
   * Creates an new asset type with the data provided via the `dto`.
   * identified by `assetTypeId`. It handles recursive errors with
   * creating trees through the `extendsType` property. In that case
   * it throws an ConflictException (409)
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function to the tenant indicated by `authInfo.tenantId`
   * @param dto The update data
   * @returns The created asset type or throws an exception in any
   * case of an error
   */
  async createAssetType(authInfo: AuthInfo, dto: CreateAssetTypeDto): Promise<AssetTypeEntity> {
    const id = await this.connection.transaction(async entityManager => {
      const typeRepo = entityManager.getRepository(AssetTypeEntity);

      const newOne = typeRepo.create({
        ...omit(dto, ['extendsType']),
        isBuiltIn: false,
        tenantId: authInfo.tenantId,
        extendsTypeId: null,
      });

      const extenTypeId = (get(dto, 'extendsType.id', dto.extendsType) || null) as string | null;
      if (extenTypeId) {
        newOne.extendsTypeId = extenTypeId;

        // Ensure that the type to extend exists
        try {
          await this.getTypeByIdOrThrow(authInfo, extenTypeId);
        } catch (ex) {
          throw new NotFoundException(`No such asset type to extend`);
        }
      }

      await typeRepo.save(newOne, { reload: true });
      await this.checkAssetTypesForLoops(authInfo, typeRepo);
      return newOne.id;
    });

    return await this.getTypeByIdOrThrow(authInfo, id);
  }

  /**
   * Updates the on `dto` supplied field for the intended asset type,
   * identified by `assetTypeId`. It prevents the user from changing
   * the `equipmentType` of an built-in asset type and also handles
   * recursive errors with creating trees through the `extendsType`
   * property. In that case it throws an ConflictException (409)
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function to the tenant indicated by `authInfo.tenantId`
   * @param assetTypeId The id of the asset type to update
   * @param dto The update data
   * @returns The updated asset type or throws an exception in any
   * case of an error
   */
  async updateAssetType(
    authInfo: AuthInfo,
    assetTypeId: string,
    dto: UpdateAssetTypeClassDto,
  ): Promise<AssetTypeEntity> {
    await this.connection.transaction(async entityManager => {
      const typeRepo = entityManager.getRepository(AssetTypeEntity);

      const assetType = await typeRepo.findOne({
        where: {
          id: assetTypeId,
          tenantId: authInfo.tenantId,
        },
      });

      if (!assetType) {
        throw new NotFoundException(`No such asset type`);
      }

      // Check if the asset type is built-in, because if so, the
      // equipment type cannot be changed
      if (assetType.isBuiltIn && typeof dto['equipmentType'] !== 'undefined') {
        throw new ConflictException(
          `Cannot updated field 'equipmentType' for built-in asset type!`,
        );
      }

      // Apply values
      for (const key in dto) {
        if (key !== 'extendsType') {
          set(assetType, key, get(dto, key));
        }
      }

      const extenTypeId = (get(dto, 'extendsType.id', dto.extendsType) || null) as string | null;
      if (extenTypeId) {
        assetType.extendsTypeId = extenTypeId;
        this.dataCache.flushAll();

        // Ensure that the type to extend exists
        try {
          await this.getTypeByIdOrThrow(authInfo, extenTypeId);
        } catch (ex) {
          throw new NotFoundException(`No such asset type to extend`);
        }
      }

      await typeRepo.save(assetType, { reload: true });
      await this.checkAssetTypesForLoops(authInfo, typeRepo);
    });

    return await this.getTypeByIdOrThrow(authInfo, assetTypeId);
  }

  /**
   * Gets the asset type id of an asset identified by `id`
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function to the tenant indicated by `authInfo.tenantId`
   * @param assetId The id of the asset to find the asset type id for
   * @param em An EntityManager (optional) which can be used to run
   * all database actions on this entity manger (transactions)
   * @returns A string with the asset type id or throws an exception
   */
  async getTypeIdByAssetIdOrFail(
    authInfo: AuthInfo,
    assetId: string,
    em?: EntityManager,
  ): Promise<string> {
    let assetTypeEntityRepo = this.assetTypeEntityRepo;
    if (em) {
      assetTypeEntityRepo = em.getRepository<AssetTypeEntity>(AssetTypeEntity);
    }

    const assetType = await assetTypeEntityRepo
      .createQueryBuilder('type')
      .leftJoinAndSelect('type.assets', 'asset')
      .where('asset.id = :assetId', { assetId })
      .andWhere('type.tenantId = :tenantId', { tenantId: authInfo.tenantId })
      .andWhere('asset.tenantId = :tenantIdAsset', { tenantIdAsset: authInfo.tenantId })
      .select('type.id')
      .getOne();

    if (!assetType) {
      throw new NotFoundException(`No such asset`);
    }

    return assetType.id;
  }

  /**
   * Fetches the list of all interhited asset types by following the
   * recursive path generated by the `extendsTypeId` fields
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function to the tenant indicated by `authInfo.tenantId`
   * @param assetTypeId The base asset type to find all parent asset
   * types from
   * @param em An EntityManager (optional) which can be used to run
   * all database actions on this entity manger (transactions)
   * @returns A string array of all parent asset type ids
   */
  async getInheritedAssetTypeIds(
    authInfo: AuthInfo,
    assetTypeId: string,
    em?: EntityManager,
  ): Promise<string[]> {
    const uid = `getInheritedAssetTypeIds_${authInfo.tenantId}_${assetTypeId}`;
    const result = this.dataCache.get<string[]>(uid);

    if (result) {
      return result;
    }

    let assetTypeEntityRepo = this.assetTypeEntityRepo;
    if (em) {
      assetTypeEntityRepo = em.getRepository<AssetTypeEntity>(AssetTypeEntity);
    }

    const allAssetTypes = await assetTypeEntityRepo.find({
      where: {
        tenantId: authInfo.tenantId,
      },
      select: ['id', 'extendsTypeId'],
    });

    const pending: string[] = [assetTypeId];
    const visited: string[] = [];
    while (pending.length > 0) {
      const currentId = pending.shift();
      if (!currentId) {
        continue;
      }

      const assetType = allAssetTypes.find(p => p.id === currentId);
      if (assetType && assetType.extendsTypeId) {
        pending.push(assetType.extendsTypeId);
      }

      visited.push(currentId);
    }

    this.dataCache.set<string[]>(uid, visited);
    return visited;
  }

  /**
   * Fetches an asset type by id and for the indicated tenant and
   * either throws an exception or returns it
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function to the tenant indicated by `authInfo.tenantId`
   * @param id The id of the asset type to fetch
   */
  async getTypeByIdOrThrow(authInfo: AuthInfo, id: string): Promise<AssetTypeEntity> {
    const assetType = await this.assetTypeEntityRepo.findOne({
      id,
      tenantId: authInfo.tenantId,
    });

    if (!assetType) {
      throw new NotFoundException(`No such asset type`);
    }

    return assetType;
  }

  /**
   * Deletes an asset type by id and for the indicated tenant and
   * either throws an exception or soft-deletes it
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function to the tenant indicated by `authInfo.tenantId`
   * @param id The id of the asset type to delete
   */
  async softDeleteById(authInfo: AuthInfo, id: string) {
    if (
      !(await this.assetTypeEntityRepo.findOne({
        id,
        tenantId: authInfo.tenantId,
      }))
    ) {
      throw new NotFoundException(`No such asset type`);
    }

    await this.assetTypeEntityRepo.softDelete({
      id,
      tenantId: authInfo.tenantId,
    });
  }

  /**
   * Returns if the asset type identified by `id` is a built-in
   * asset type or not (boolean) or throws an exception
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function to the tenant indicated by `authInfo.tenantId`
   * @param id The id of the asset type to check for
   */
  async isBuiltInByIdOrFail(authInfo: AuthInfo, id: string): Promise<boolean> {
    const type = await this.assetTypeEntityRepo.findOne({
      id,
      tenantId: authInfo.tenantId,
    });

    if (!type) {
      throw new NotFoundException(`No such asset type`);
    }

    return !!type.isBuiltIn;
  }

  /**
   * This function ensures that for a given tenant the
   * default asset type is created
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function to the tenant indicated by `authInfo.tenantId`
   */
  async ensureDefaultAssetTypesForTenant(authInfo: AuthInfo) {
    // Now execute all the operations in a transaction
    await this.connection.transaction(async entityManager => {
      const typeRepo = entityManager.getRepository(AssetTypeEntity);

      const builtInCount = await typeRepo.count({
        where: {
          tenantId: authInfo.tenantId,
          isBuiltIn: true,
        },
      });

      // If there is at least one built-in, we assume that we don't
      // need to run the migration once again
      if (builtInCount > 0) {
        return;
      }

      // Otherwise create it ...
      const newGenericType = typeRepo.create({
        isBuiltIn: true,
        tenantId: authInfo.tenantId,
        id: uuid(),
        equipmentType: BUILTIN_GENERIC_ASSET_TYPE_EQUIPMENT_TYPE,
        name: BUILTIN_GENERIC_ASSET_TYPE_NAME,
      });
      await typeRepo.save(newGenericType);
    });
  }
  // ---

  /**
   * Checks all the existing asset types for a tenant, if they include
   * a loop or island of nodes and throws an exception in that event
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function to the tenant indicated by `authInfo.tenantId`
   * @param typeRepo The repo for database access, to be used inside
   * a transaction
   */
  private async checkAssetTypesForLoops(authInfo: AuthInfo, typeRepo: Repository<AssetTypeEntity>) {
    const all = await typeRepo.find({
      where: {
        tenantId: authInfo.tenantId,
      },
      select: ['id', 'extendsTypeId'],
    });

    try {
      // Check it, will throw on error
      AssetHierarchyBuilder.check(all.map(a => ({ id: a.id, parentId: a.extendsTypeId })));
    } catch (ex) {
      throw new ConflictException(`There might is a loop with the 'extendsType' property.`);
    }
  }
}
