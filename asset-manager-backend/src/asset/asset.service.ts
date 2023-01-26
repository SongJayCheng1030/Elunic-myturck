import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@rewiko/crud-typeorm';
import { get, has, isEqual, omit, pick, set, uniq } from 'lodash';
import { AssetAliasType } from 'shared/common/models';
import { AuthInfo } from 'shared/common/types';
import { SharedFileService } from 'shared/nestjs';
import { UnitedPropertyDto } from 'src/asset-property/dto/UnitedPropertyDto';
import {
  Brackets,
  Connection,
  DeepPartial,
  EntityManager,
  EntityTarget,
  In,
  Not,
  Repository,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

import { ActivityLogObjectType } from '../activity-log/activity-log.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActivityEventType, ActivityValueType } from '../activity-log/dto/ActivityEventType';
import { AssetHierarchyEntity } from '../asset-hierarchy/asset-hierarchy.entity';
import { AssetPropertyService } from '../asset-property/asset-property.service';
import { AssetTypeService } from '../asset-type/asset-type.service';
import { AssetEntity } from './asset.entity';
import { AssetAliasEntity } from './asset-alias.entity';
import { AssetDocumentEntity } from './asset-document.entity';
import {
  COMPLEX_PROPS,
  CreateAssetDtoRequest,
  CreateAssetInitialRequiredProperties,
} from './dto/CreateAssetDtoRequest';
import { SIMPLE_PROPS, UpdateAssetDtoRequest } from './dto/UpdateAssetDtoRequest';

@Injectable()
export class AssetService extends TypeOrmCrudService<AssetEntity> {
  constructor(
    @InjectRepository(AssetEntity)
    private assetEntityRepo: Repository<AssetEntity>,
    @InjectRepository(AssetAliasEntity)
    private assetAliasRepo: Repository<AssetAliasEntity>,
    @InjectConnection()
    private readonly connection: Connection,
    private readonly assetTypeService: AssetTypeService,
    private readonly logService: ActivityLogService,
    private readonly propService: AssetPropertyService,
    private readonly sharedFileService: SharedFileService,
    @InjectLogger(AssetService.name)
    private readonly logger: Logger,
  ) {
    super(assetEntityRepo);
  }

  /**
   * Cheks if for a given list of asset id's all id's are
   * existing and real assets for the current tenant. Will not
   * fail if `undefined` / `null` or a non-array value is provided
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param ids Array of id's to check if they exist which might
   * also contain duplicates (automatically filtered out)
   */
  async checkIfAssetsExistByIdOrFail(authInfo: AuthInfo, ids: string[]): Promise<void> {
    if (!Array.isArray(ids)) {
      return;
    }

    const idsUnique = uniq(ids);

    const existingIdsRaw = await this.assetEntityRepo.find({
      where: {
        id: In(idsUnique),
        tenantId: authInfo.tenantId,
      },
      select: ['id'],
    });
    const existingIds = existingIdsRaw.map(e => e.id);

    if (existingIds.length !== idsUnique.length) {
      const firstNotExist = idsUnique.find(p => !existingIds.includes(p)) || 'N/A';
      throw new NotFoundException(`No asset for id '${firstNotExist}' found.`);
    }
  }

  /**
   * Retrieves an asset by a given `id` with the option for fetching all
   * data for it (documents, aliases, assetType). The `assetType` is
   * always populated when calling this function
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param id The id of the asset to fetch
   * @param full If all the data should be fetched or not
   * @param assetEntityRepo Optionally the repo to use to fetch the data
   * from the database
   */
  async getAssetByIdOrFail(
    authInfo: AuthInfo,
    id: string,
    full = false,
    assetEntityRepo?: Repository<AssetEntity>,
  ): Promise<AssetEntity> {
    const asset = await (assetEntityRepo || this.assetEntityRepo).findOne({
      where: {
        id,
        tenantId: authInfo.tenantId,
      },
      relations: ['assetType', ...(full ? ['aliases', 'documents', 'aliases.asset'] : [])],
    });
    if (!asset) {
      throw new NotFoundException(`No such asset found.`);
    }
    return asset;
  }

  async getAssetAliasByType(authInfo: AuthInfo, type: AssetAliasType): Promise<AssetAliasEntity[]> {
    const alias = await this.assetAliasRepo.find({
      where: {
        tenantId: authInfo.tenantId,
        type,
      },
      relations: ['asset'],
    });
    return alias;
  }

  /**
   * Finds all assets in the system for the current tenant where the
   * id is not included in the given `id` array
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param ids An array of asset ids (not checked) to exclude from
   * the list of returned assets
   */
  async getAssetsWhereIdNotIn(authInfo: AuthInfo, ids: string[]): Promise<AssetEntity[]> {
    const assets = await this.assetEntityRepo.find({
      where: {
        id: Not(In(ids)),
        tenantId: authInfo.tenantId,
      },
      relations: ['assetType', 'documents'],
    });
    return assets;
  }

  /**
   * Fetches asset information for a list of ids in bulk (faster
   * than single acces). Returns always an array with length gte 0.
   * Includes the data for the field `assetType`
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param ids The ids of assets to fetch data for
   */
  async getAssetsByIdsBulk(authInfo: AuthInfo, ids: string[]): Promise<AssetEntity[]> {
    const assets = await this.assetEntityRepo.find({
      where: {
        id: In(ids),
        tenantId: authInfo.tenantId,
      },
      relations: ['assetType', 'documents'],
    });

    return assets || [];
  }

  /**
   * Returns a list of assets for a provided alias string. Searches
   * the alias field by a string match (equal) and also string contains.
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param alias The alias to find assets for
   */
  async findAssetsByAlias(authInfo: AuthInfo, alias: string): Promise<AssetEntity[]> {
    const stmt = this.assetEntityRepo
      .createQueryBuilder('asset')
      .where('asset.tenant_id = :tenantId', { tenantId: authInfo.tenantId })
      .leftJoinAndSelect('asset.aliases', 'alias')
      .andWhere('alias.tenant_id = :tenantId', { tenantId: authInfo.tenantId })
      .andWhere(
        new Brackets(qb => {
          qb.where('alias.alias = :alias', { alias }).orWhere('alias.alias LIKE :aliasLike', {
            aliasLike: `%${alias}%`,
          });
        }),
      );

    return await stmt.getMany();
  }

  /**
   * Soft-deletes an asset, identified by the given `id`. If soft-deleted,
   * the asset is no longer listed but can be queried by id
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param id The id of the asset to soft-delete
   */
  async softDeleteById(authInfo: AuthInfo, id: string): Promise<void> {
    await this.connection.transaction(async entityManager => {
      const assetRepo = entityManager.getRepository(AssetEntity);
      const hierarchyRepo = entityManager.getRepository(AssetHierarchyEntity);

      const asset = await assetRepo.findOne({ id, tenantId: authInfo.tenantId });
      if (!asset) {
        throw new NotFoundException(`No such asset found.`);
      }

      // set the soft delete (deleted_at) for this asset
      await assetRepo.softDelete({ id, tenantId: authInfo.tenantId });

      // remove soft-deleted asset from tree
      await hierarchyRepo.delete({
        id,
        tenantId: authInfo.tenantId,
      });

      await this.logService.create(
        authInfo,
        ActivityLogObjectType.ASSET,
        ActivityEventType.SOFT_DELETED,
        id,
        null,
        null,
        null,
        null,
        entityManager,
      );
    });
  }

  /**
   * Fetches all assets for a given asset type id
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param typeId The asset type id to fetch assets for
   */
  async getAssetsByTypeId(authInfo: AuthInfo, typeId: string): Promise<AssetEntity[]> {
    const types = await this.assetEntityRepo.find({
      where: {
        tenantId: authInfo.tenantId,
        assetType: {
          id: typeId,
        },
      },
    });

    return types;
  }

  /**
   * Creates a new asset. This function is named "unite", because it not
   * only creates the "plain" asset but also appends the provided document
   * and alias data (complex fields) and creates the asset activities
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param dto The raw asset data, provided by the user
   */
  async createAssetUnite(authInfo: AuthInfo, dto: CreateAssetDtoRequest): Promise<AssetEntity> {
    const id = await this.connection.transaction(async entityManager => {
      const assetRepo = entityManager.getRepository(AssetEntity);
      const docRepo = entityManager.getRepository(AssetDocumentEntity);
      const aliasRepo = entityManager.getRepository(AssetAliasEntity);

      // Create a new asset object, populated with the simple data
      let newAsset = assetRepo.create(omit(dto, COMPLEX_PROPS) as DeepPartial<AssetEntity>);
      newAsset.tenantId = authInfo.tenantId;

      // Assign an asset type
      const assetTypeId = (get(dto, 'assetType.id', dto.assetType) || null) as string | null;
      newAsset.assetType = await this.assetTypeService.getTypeByIdOrThrow(
        authInfo,
        assetTypeId || '',
      );

      // Create the asset initially
      newAsset = await assetRepo.save(newAsset, { reload: true });
      await this.logService.create(
        authInfo,
        ActivityLogObjectType.ASSET,
        ActivityEventType.CREATED,
        newAsset.id,
        null,
        null,
        omit(dto, COMPLEX_PROPS) as ActivityValueType,
        null,
        entityManager,
      );

      // Add documents, iff any
      if (dto.documents) {
        newAsset.documents = docRepo.create(
          dto.documents.map(x => ({
            ...x,
            tenantId: authInfo.tenantId,
            createdBy: authInfo.id,
            assetId: newAsset.id,
          })),
        );
      }

      // Add aliases, iff any
      if (dto.aliases) {
        newAsset.aliases = aliasRepo.create(
          dto.aliases.map(x => ({
            ...x,
            tenantId: authInfo.tenantId,
            createdBy: authInfo.id,
            assetId: newAsset.id,
          })),
        );
      }

      // Save asset
      await this.handleAssetUpdateExceptions(assetRepo, newAsset);

      // Handle required fields
      await this.createAssetHandleRequiredFields(
        authInfo,
        entityManager,
        newAsset,
        dto.requiredProperties || {},
      );

      return newAsset.id;
    });

    return this.getAssetByIdOrFail(authInfo, id, true);
  }

  /**
   * Clones the asset, identified by id `assetId` and adds the
   * data `update` to id (like an edit)
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param assetId The id of the asset to clone
   * @param update The data to update the asset with
   */
  async cloneAssetById(
    authInfo: AuthInfo,
    assetId: string,
    update: UpdateAssetDtoRequest,
  ): Promise<AssetEntity> {
    const newId = await this.connection.transaction<string>(async entityManager => {
      const assetRepo = entityManager.getRepository(AssetEntity);

      const assetToClone = await assetRepo.findOne({
        where: {
          tenantId: authInfo.tenantId,
          id: assetId,
        },
        relations: ['assetType'],
      });

      if (!assetToClone) {
        throw new NotFoundException(`No such asset to clone`);
      }

      // Check if the imageId is provided and should be cloned
      let clonedImageId: string | null = null;
      if (assetToClone.imageId) {
        try {
          clonedImageId = await this.sharedFileService.cloneFileByIdOrFail(
            authInfo,
            assetToClone.imageId,
            true,
          );
          this.logger.debug(
            `Original imageId=${assetToClone.imageId}, cloned imageId=${clonedImageId}`,
          );
        } catch (ex) {
          // Don't fail the entire operation when cloning the image
          // fails; just fill it with `null` (design decision of asset manager)
          this.logger.warn(`Failed to clone imageId for asset:`, ex);
          clonedImageId = null;
        }
      }

      // Create the clone
      const newId = uuid();
      const newAsset = assetRepo.create({
        ...pick(assetToClone, ['tenantId', 'name', 'description', 'deletedAt']),
        id: newId,
        imageId: clonedImageId,
        updatedAt: new Date(),
        createdAt: new Date(),
        assetType: assetToClone.assetType,
      });
      await assetRepo.save(newAsset);

      // Update with the provided data
      await this.updateAssetByIdUnite(authInfo, newId, update, entityManager);

      // Clone properties
      await this.propService.clonePropsForAssetId(authInfo, assetId, newId, entityManager);

      // Create clone entry
      await this.logService.create(
        authInfo,
        ActivityLogObjectType.ASSET,
        ActivityEventType.CREATED,
        newAsset.id,
        null,
        null,
        omit(update, COMPLEX_PROPS) as ActivityValueType,
        'CLONED',
        entityManager,
      );

      return newId; // Done
    });

    return this.getAssetByIdOrFail(authInfo, newId, true);
  }

  /**
   * Updates an asset for a given tenant and id with the provided
   * update data. Everything is executed in a transaction; activities
   * are created automatically, if needed. Will fail on error and
   * persist no data. If unkown asset, it will also fail.
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param id The id of the asset to change
   * @param update The data to update the asset with
   * @param entityManager If an entity manager is provided, the actions
   * are not run in a transaction but this entity manager is used
   */
  async updateAssetByIdUnite(
    authInfo: AuthInfo,
    id: string,
    update: UpdateAssetDtoRequest,
    entityManager?: EntityManager,
  ): Promise<AssetEntity> {
    const updateCallbackAsync = async (entityManager: EntityManager) => {
      const assetRepo = entityManager.getRepository(AssetEntity);
      const docRepo = entityManager.getRepository(AssetDocumentEntity);
      const aliasRepo = entityManager.getRepository(AssetAliasEntity);

      // Check if the asset exists
      const asset = await assetRepo.findOne({
        where: {
          id,
          tenantId: authInfo.tenantId,
        },
        relations: ['assetType', 'aliases', 'documents'],
      });

      if (!asset) {
        throw new NotFoundException(`No such asset`);
      }

      // Check for the simple properties to update
      for (const prop of SIMPLE_PROPS) {
        if (has(update, prop) && !isEqual(get(asset, prop), get(update, prop))) {
          // Create a new activity entry
          await this.logService.create(
            authInfo,
            ActivityLogObjectType.ASSET,
            ActivityEventType.FIELD_UPDATED,
            id,
            prop,
            get(asset, prop),
            get(update, prop),
            null,
            entityManager,
          );

          set(asset, prop, update[prop as keyof UpdateAssetDtoRequest]);
        }
      }

      // If the asset type changed, update it
      const newAssetTypeId = (get(update, 'assetType.id', update.assetType) || null) as
        | string
        | null;
      if (newAssetTypeId && asset.assetType.id !== newAssetTypeId) {
        const newType = await this.assetTypeService.getTypeByIdOrThrow(authInfo, newAssetTypeId);

        await this.logService.create(
          authInfo,
          ActivityLogObjectType.ASSET,
          ActivityEventType.ASSET_TYPE_UPDATED,
          id,
          'assetType',
          asset.assetType.id,
          newAssetTypeId,
          null,
          entityManager,
        );

        // Perform the actual assignment
        asset.assetType = newType;

        // By now, the asset is linked to the new asset type but all the
        // properties might be not relevant anymore. Therefore, we also
        // need to migrate the properties
        await this.propService.migratePropsOnAssetTypeChangeForAsset(
          authInfo,
          id,
          newType.id,
          entityManager,
        );
      }

      // Documents need to be updated
      if (update.documents) {
        const originalDocs = asset.documents;

        asset.documents = docRepo.create(
          update.documents.map(x => ({
            ...x,
            tenantId: authInfo.tenantId,
            createdBy: authInfo.id,
            assetId: asset.id,
          })),
        );

        // Create all delete activities manually
        await this.createActivitiesForDeletedRelations(
          originalDocs,
          asset.documents,
          entityManager,
          AssetDocumentEntity,
        );
      }

      // Aliases need to be updated
      if (update.aliases) {
        const originalAliases = asset.aliases;

        asset.aliases = aliasRepo.create(
          update.aliases.map(x => ({
            ...x,
            tenantId: authInfo.tenantId,
            createdBy: authInfo.id,
            assetId: asset.id,
          })),
        );

        // Create all delete activities manually
        await this.createActivitiesForDeletedRelations(
          originalAliases,
          asset.aliases,
          entityManager,
          AssetAliasEntity,
        );
      }

      // Save the updated object and finish the transaction
      await this.handleAssetUpdateExceptions(assetRepo, asset);
    };

    if (entityManager) {
      await updateCallbackAsync(entityManager);
      return this.getAssetByIdOrFail(
        authInfo,
        id,
        true,
        entityManager.getRepository<AssetEntity>(AssetEntity),
      );
    } else {
      await this.connection.transaction(updateCallbackAsync);
      // Return the full, updated asset back
      return this.getAssetByIdOrFail(authInfo, id, true);
    }
  }

  // ---

  /**
   * Handle the logic for required fields when creating a new
   * asset. This will fail with an exception when required fields
   * are not supplied
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param em The EntityManager used to run the queries on (transaction)
   * @param asset The asset (newly created) to attach the properties to
   * @param providedProps The properties, provided by the user
   */
  private async createAssetHandleRequiredFields(
    authInfo: AuthInfo,
    em: EntityManager,
    asset: AssetEntity,
    providedProps: CreateAssetInitialRequiredProperties,
  ) {
    this.logger.debug(`createAssetHandleRequiredFields(): assetType=${asset.assetType.id}`);

    // Get all properties required by this asset type; this does not
    // need to be executed in the context of the parent transaction
    // because it only reads data outside the scope of the current
    // modification
    const props = (await this.propService.getPropertiesByAssetId(authInfo, asset.id, em)) || [];
    const required = props.filter(p => p.isRequired) || [];
    this.logger.debug(`requiredProps: #${required.length}, totalProps: #${props.length}`);

    // Validate the input and check if the user really supplied all
    // the required properties; the following object will accumulate
    // the data to be created in the database (values for the properties)
    const forCreate: {
      [key: string]: {
        value: string | number | boolean;
        prop: UnitedPropertyDto;
      };
    } = {};
    const missingProps: string[] = [];

    for (const req of required) {
      if (has(providedProps, req.key)) {
        forCreate[req.key] = {
          value: providedProps[req.key],
          prop: req,
        };
      } else {
        missingProps.push(req.key);
      }
    }

    // Check that everything is provided
    this.logger.debug(`missingProps: #${missingProps.length}, ${missingProps.join(', ')}`);
    if (missingProps.length > 0) {
      throw new BadRequestException(
        [
          `The selected asset type requires the following`,
          `properties to be provided with the create request:`,
          missingProps.join(', '),
        ].join(' '),
      );
    }

    // Now we are ready to go as all checks have been performed
    // successfully and we can create the property values
    for (const key in forCreate) {
      const toCreate = forCreate[key];

      await this.propService.patchPropertyByIdAndAssetId(
        authInfo,
        toCreate.prop.id,
        asset.id,
        {
          value: toCreate.value,
        },
        em,
      );
    }

    this.logger.debug(`requiredProps created for asset ${asset.id}`);
  }

  /**
   * Handle the exceptions which might arise from saving the
   * asset
   *
   * @param assetRepo The asset repo to save to
   * @param asset The asset to save
   */
  private async handleAssetUpdateExceptions(
    assetRepo: Repository<AssetEntity>,
    asset: AssetEntity,
  ) {
    try {
      await assetRepo.save(asset);
    } catch (ex: any) {
      // Check for double alias usage
      if (ex.code === 'ER_DUP_ENTRY' && (ex.sqlMessage || '').indexOf('asset_alias_entity') > -1) {
        throw new ConflictException(`One of the provided asset aliases is already in use!`);
      }
      throw ex;
    }
  }

  /**
   * Creates activities for delete actions by comparing the provided
   * relation list before and after and broadcasting a `beforeRemove`
   * event to all known subscribers for the provided EntityManager
   *
   * @param relationsBefore The list of relations before the change
   * @param relationsAfter The list of relations after the change
   * @param entityManager The EntityManager for extracting the subscribers
   * and TypeORM information
   * @param target The target entity to operate on
   */
  private async createActivitiesForDeletedRelations<T>(
    relationsBefore: T & Array<{ id: string }>,
    relationsAfter: T & Array<{ id: string }>,
    entityManager: EntityManager,
    target: Function | string,
  ) {
    const deleted = relationsBefore.filter(o => relationsAfter.findIndex(p => p.id === o.id) < 0);

    for (const sub of this.connection.subscribers) {
      // @ts-ignore
      if (sub?.listenTo() !== target) {
        continue;
      }

      if (sub.beforeRemove) {
        for (const k of deleted) {
          await sub.beforeRemove({
            connection: this.connection,
            queryRunner: entityManager.queryRunner || this.connection.createQueryRunner(),
            manager: entityManager,
            entity: k,
            metadata: entityManager.getRepository<T>(target as EntityTarget<T>).metadata,
            databaseEntity: k,
            entityId: k.id,
          });
        }
      }
    }
  }
}
