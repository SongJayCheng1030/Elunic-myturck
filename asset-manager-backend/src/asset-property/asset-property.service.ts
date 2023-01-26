import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFound } from 'http-errors';
import { get, has, pick, set } from 'lodash';
import { AuthInfo } from 'shared/common/types';
import { Brackets, EntityManager, In, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { AssetTypeService } from '../asset-type/asset-type.service';
import { AssetPropertyDefinitionEntity } from './asset-property-definition.entity';
import { AssetPropertyValueEntity } from './asset-property-value.entity';
import { CreatePropertyDefReqDto } from './dto/CreatePropertyDefReqDto';
import { UnitedPropertyDto, UnitedPropertyMode } from './dto/UnitedPropertyDto';
import { UpdatePropertyDefReqClassDto } from './dto/UpdatePropertyDefReqDto';
import { UpdatePropertyValReqDto } from './dto/UpdatePropertyValReqDto';

@Injectable()
export class AssetPropertyService {
  constructor(
    @InjectRepository(AssetPropertyDefinitionEntity)
    private readonly propDefEntityRepo: Repository<AssetPropertyDefinitionEntity>,
    @InjectRepository(AssetPropertyValueEntity)
    private readonly propValEntityRepo: Repository<AssetPropertyValueEntity>,
    private readonly assetTypeService: AssetTypeService,
    @InjectLogger(AssetPropertyService.name)
    private readonly logger: Logger,
  ) {}

  /**
   * Clones all properties of asset `cloneFromAssetId` to asset `cloneToAssetId`
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function only to the data of the tenant indicated by
   * `authInfo.tenantId`
   * @param cloneFromAssetId The id of the asset to clone the properties from
   * @param cloneToAssetId The id of the asset to clone the properties to
   * @param entityManager Optionally the entityManager to run the
   * queries on (e.g. if in called from inside a transaction)
   */
  async clonePropsForAssetId(
    authInfo: AuthInfo,
    cloneFromAssetId: string,
    cloneToAssetId: string,
    entityManager?: EntityManager,
  ) {
    this.logger.debug(`clonePropsForAssetId(..., ${cloneFromAssetId}, ${cloneToAssetId}, ...)`);
    let propValRepo = this.propValEntityRepo;
    if (entityManager) {
      propValRepo = entityManager.getRepository<AssetPropertyValueEntity>(AssetPropertyValueEntity);
    }

    const allPropValues =
      (await propValRepo.find({
        where: {
          assetId: cloneFromAssetId,
          tenantId: authInfo.tenantId,
        },
        relations: ['definition'],
      })) || [];
    this.logger.debug(`Found ${allPropValues.length} property values to clone`);

    if (allPropValues.length < 1) {
      return; // Nothing to do
    }

    for (const prop of allPropValues) {
      const newPropValue = propValRepo.create({
        ...pick(prop, ['tenantId', 'value', 'position', 'isHidden', 'isRequired', 'createdAt']),
        id: uuid(),
        definition: prop.definition,
        assetId: cloneToAssetId,
        updatedAt: new Date(),
      });
      await propValRepo.save(newPropValue);
    }
  }

  /**
   * Migrates the properties of an asset if the asset type of the
   * property is changed to a new property. If the keys of old and
   * new properties match (between the old and new asset type) and
   * the type (string, number, ...) matches, the data is taken over
   * and preserved
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function only to the data of the tenant indicated by
   * `authInfo.tenantId`
   * @param assetId The id of the asset to act on
   * @param newAssetTypeId The id of the new asset type for the asset
   * @param entityManager Optionally the entityManager to run the
   * queries on (e.g. if in called from inside a transaction)
   * @returns Throws no exeption if has no problems
   */
  async migratePropsOnAssetTypeChangeForAsset(
    authInfo: AuthInfo,
    assetId: string,
    newAssetTypeId: string,
    entityManager?: EntityManager,
  ) {
    this.logger.debug(
      `migratePropsOnAssetTypeChangeForAsset(..., ${assetId}, ${newAssetTypeId}, ...)`,
    );
    let propValRepo = this.propValEntityRepo;
    if (entityManager) {
      propValRepo = entityManager.getRepository<AssetPropertyValueEntity>(AssetPropertyValueEntity);
    }

    // Find all overwritten values
    const allPropValues =
      (await propValRepo.find({
        where: {
          assetId,
          tenantId: authInfo.tenantId,
        },
        relations: ['definition'],
      })) || [];
    this.logger.debug(`Found ${allPropValues.length} old property values to delete`);

    if (allPropValues.length < 1) {
      // Nothing to do ;-)
      return;
    }

    // Delete the value entries
    await propValRepo.delete({
      id: In(allPropValues.map(v => v.id)),
      tenantId: authInfo.tenantId,
    });

    // Get the possible properties for the new type to see if
    // some of the old values could be taken over
    this.logger.debug(`Checking if values can be taken over ...`);
    const props = await this.getPropertiesByAssetTypeIdRaw(
      authInfo,
      [newAssetTypeId],
      entityManager,
    );
    for (const prop of props) {
      // Check if a property with the correct key and type (!!) also exists
      // for the target asset type. Then we can migrate ...
      const valueExists = allPropValues.find(
        v => v.definition.key === prop.key && v.definition.type === prop.type,
      );

      if (!valueExists) {
        this.logger.debug(`  ${prop.key} (${prop.id}) --> NO`);
        continue;
      }
      this.logger.debug(`  ${prop.key} (${prop.id}) --> TAKING OVER`);

      const newValueForDef = propValRepo.create({
        definition: prop,
        tenantId: authInfo.tenantId,
        assetId,
        value: valueExists.value,
        position: valueExists.position,
        isHidden: valueExists.isHidden,
        isRequired: valueExists.isRequired,
        createdAt: valueExists.createdAt,
        updatedAt: valueExists.updatedAt,
      });

      await propValRepo.save(newValueForDef);
    }

    this.logger.debug(`Migration done`);
  }

  /**
   * Fetches the property for a definition e.g. assigned to an
   * `AssetType`
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function only to the data of the tenant indicated by
   * `authInfo.tenantId`
   * @param assetTypeId The id of the `AssetType` to get the property for
   * @param propertyId The property id of the property to fetch
   * @returns Either the `UnitedPropertyDto` object or an Error is
   * thrown if not found
   */
  async getPropertyByAssetTypeId(
    authInfo: AuthInfo,
    assetTypeId: string,
    propertyId: string,
  ): Promise<UnitedPropertyDto> {
    const stmt = this.propDefEntityRepo
      .createQueryBuilder('props')
      .where('asset_type_id = :assetTypeId', { assetTypeId })
      .andWhere('props.tenantId = :tenantId', { tenantId: authInfo.tenantId })
      .leftJoinAndSelect('props.values', 'val')
      .andWhere('val.asset_id IS NULL')
      .andWhere('val.id = :propertyId', { propertyId })
      .andWhere('val.tenantId = :tenantIdVal', { tenantIdVal: authInfo.tenantId });

    const prop = await stmt.getOne();

    if (!prop) {
      throw new NotFoundException(`No such property`);
    }

    // We don't need to overlay, because we only want to
    // get the "property definition" and the value for that since
    // on an `AssetType` we have the definitions
    return new UnitedPropertyDto(prop, assetTypeId);
  }

  /**
   * Finds a property by a given id for an `Asset` identified by
   * the given "assetId".
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function only to the data of the tenant indicated by
   * `authInfo.tenantId`
   * @param assetId The asset id to fetch the property for
   * @param propertyId The id of the property to fetch
   * @param em An EntityManager (optional) which can be used to run
   * all database actions on this entity manger (transactions)
   * @returns Either the `UnitedPropertyDto` object or an Error is
   * thrown if not found
   */
  async getPropertyByAssetId(
    authInfo: AuthInfo,
    assetId: string,
    propertyId: string,
    em?: EntityManager,
  ): Promise<UnitedPropertyDto> {
    let propDefRepo = this.propDefEntityRepo;
    if (em) {
      propDefRepo = em.getRepository<AssetPropertyDefinitionEntity>(AssetPropertyDefinitionEntity);
    }

    const stmt = propDefRepo
      .createQueryBuilder('props')
      .where('props.tenantId = :tenantId', { tenantId: authInfo.tenantId })
      .leftJoinAndSelect('props.values', 'val')
      .leftJoinAndSelect('val.asset', 'asset')
      .andWhere('val.tenantId = :tenantIdVal', { tenantIdVal: authInfo.tenantId })
      .andWhere('val.id = :id', { id: propertyId })
      .andWhere(
        new Brackets(qb => {
          qb.where('val.asset_id IS NULL').orWhere('val.asset_id = :assetId', { assetId });
        }),
      );

    const prop = await stmt.getOne();

    if (!prop) {
      throw new NotFoundException(`No such property`);
    }

    return new UnitedPropertyDto(prop, prop.assetTypeId, UnitedPropertyMode.OVERLAY);
  }

  /**
   * Fetches the list of set properties for an asset type
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function only to the data of the tenant indicated by
   * `authInfo.tenantId`
   * @param assetTypeId The id of the `AssetType` to get the properties
   * for
   * @returns A list of properties for the asset type
   */
  async getPropertiesByAssetTypeId(
    authInfo: AuthInfo,
    assetTypeId: string,
  ): Promise<UnitedPropertyDto[]> {
    const allAssetTypesRec = await this.assetTypeService.getInheritedAssetTypeIds(
      authInfo,
      assetTypeId,
    );
    const props = await this.getPropertiesByAssetTypeIdRaw(authInfo, allAssetTypesRec);
    return props.map(p => new UnitedPropertyDto(p, assetTypeId, UnitedPropertyMode.NO_OVERLAY));
  }

  /**
   * Returns a list of properties with their values for a given
   * `Asset` id. For this the definition is fetched and overlayed
   * with all currently defined value overwrites.
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function only to the data of the tenant indicated by
   * `authInfo.tenantId`
   * @param assetId The id of the `Asset` to fetch the properties
   * for
   * @param em An EntityManager (optional) which can be used to run
   * all database actions on this entity manger (transactions)
   * @param filterKey An optional parameter to query only properties
   * with a specific key
   * @param filterType An optional parameter to query only properties
   * with a specific type
   * @returns An array of `UnitedPropertyDto`s
   */
  async getPropertiesByAssetId(
    authInfo: AuthInfo,
    assetId: string,
    em?: EntityManager,
    filterKey?: string | undefined | null,
    filterType?: string | undefined | null,
  ): Promise<UnitedPropertyDto[]> {
    const assetTypeId = await this.assetTypeService.getTypeIdByAssetIdOrFail(authInfo, assetId, em);
    const assetTypeIdsRec = await this.assetTypeService.getInheritedAssetTypeIds(
      authInfo,
      assetTypeId,
      em,
    );

    let propDefEntityRepo = this.propDefEntityRepo;
    let propValEntityRepo = this.propValEntityRepo;
    if (em) {
      propDefEntityRepo = em.getRepository<AssetPropertyDefinitionEntity>(
        AssetPropertyDefinitionEntity,
      );
      propValEntityRepo = em.getRepository<AssetPropertyValueEntity>(AssetPropertyValueEntity);
    }

    // Fetch all property definitions with overwrites for
    // a given asset type (inferred by the asset id).
    // Inside the value definition either the `asset_id` is
    // set to NULL (= this is the value for the definition itself)
    // or it is set to the `Asset`s id we are fetching
    // (= an overwrite)
    let stmt = propDefEntityRepo
      .createQueryBuilder('props')
      .where('props.asset_type_id IN (:assetTypeIdsRec)', { assetTypeIdsRec });

    if (filterKey && typeof filterKey === 'string') {
      stmt = stmt.andWhere('props.key = :key', { key: filterKey });
    }

    if (filterType && typeof filterType === 'string') {
      stmt = stmt.andWhere('props.type = :type', { type: filterType.toUpperCase() });
    }

    stmt = stmt
      .andWhere('props.tenantId = :tenantId', { tenantId: authInfo.tenantId })
      .leftJoinAndSelect('props.values', 'val')
      .andWhere('val.tenantId = :tenantIdVals', { tenantIdVals: authInfo.tenantId })
      .leftJoinAndSelect('val.asset', 'asset')
      .andWhere(
        new Brackets(qb => {
          qb.where('val.asset_id IS NULL').orWhere('val.asset_id = :assetId', { assetId });
        }),
      );
    const props = (await stmt.getMany()) || [];

    this.logger.debug(`getPropertiesByAssetId(..., ${assetId}): ${props.length} props found`);

    for (const prop of props) {
      const hasDefinitionValue = prop.values.find(p => !p.asset || p.asset === null);
      const hasAssetValue = prop.values.find(p => p.asset?.id === assetId);

      // If we cannot find a definition for the property value overwrite
      // this is a major issue. But this should not happen due to FKs in
      // the database
      if (!hasDefinitionValue) {
        this.logger.error(`For asset #${assetId} (${assetTypeId}): no definition found`);
        this.logger.error(` for prop ${prop.id}`);

        throw new HttpException(`Cannot resolve definition for property value`, 500);
      }

      // If ther is no value overwrite for the asset right now, we
      // are going to create it since we need to supply the id of the
      // overwrite to the client so that he can update the data for
      // which the id of the value is used
      if (!hasAssetValue) {
        const newAssetValue = propValEntityRepo.create({
          definition: prop,
          tenantId: authInfo.tenantId,
          assetId,
          value: null,
          position: null,
          isHidden: null,
          isRequired: null,
        });

        await propValEntityRepo.save(newAssetValue, { reload: true });
        prop.values.push(newAssetValue);
      }
    }

    // Go through all properties and use the `UnitedPropertyDto` utility
    // class to overlay the data as described: a property for an asset can
    // have two values: one for the definition and one with overwritten data
    // based on the asset. The UnitedPropertyMode.OVERLAY option takes care
    // that it is correctly overlayed
    return props.map(p => new UnitedPropertyDto(p, assetTypeId, UnitedPropertyMode.OVERLAY));
  }

  /**
   * Creates a new property. Properties can **only** be defined for
   * `AssetType`s. An `Asset` can only overwrite a property defined
   * for it's current asset type.
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function only to the data of the tenant indicated by
   * `authInfo.tenantId`
   * @param prop The data for the property to create
   * @param assetTypeId The `AssetType`s id to create the property for
   * @returns The created property
   */
  async createProperty(
    authInfo: AuthInfo,
    prop: CreatePropertyDefReqDto,
    assetTypeId: string,
  ): Promise<UnitedPropertyDto> {
    // Get the asset type
    const assetType = await this.assetTypeService.getTypeByIdOrThrow(authInfo, assetTypeId);
    const key = this.santizePropertyKey(prop.key);

    if (!key) {
      throw new BadRequestException(`'Invalid key value supplied for property'`);
    }

    // Check if a "conflicting" element already exists
    const n = await this.propDefEntityRepo.count({
      where: {
        tenantId: authInfo.tenantId,
        assetType,
        key,
      },
    });
    if (n > 0) {
      throw new ConflictException(`A property with key "${key}" already exists`);
    }

    // Create a new definition object and save it
    const definition = this.propDefEntityRepo.create({
      assetType,
      name: prop.name,
      type: prop.type,
      tenantId: authInfo.tenantId,
      key,
    });
    await this.propDefEntityRepo.save(definition, { reload: true });

    // Create a new value for that definition with the
    // supplied data and save it
    const newValue = this.propValEntityRepo.create({
      definition,
      asset: null,
      value: prop.value,
      position: prop.position,
      isHidden: prop.isHidden,
      isRequired: prop.isRequired,
      tenantId: authInfo.tenantId,
    });
    await this.propValEntityRepo.save(newValue);

    // Re-fetch the data and return it
    return this.getPropertyByAssetTypeId(authInfo, assetTypeId, newValue.id);
  }

  /**
   * Updates the data of a property of an `AssetType`.
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function only to the data of the tenant indicated by
   * `authInfo.tenantId`
   * @param propertyId The id of the property (supplied inside
   * the `UnitedPropertyDto` `id` field) to edit
   * @param assetTypeId The id of the `AssetType` for which this
   * property is defined
   * @param data The actual data to update
   * @returns The updated property
   */
  async patchPropertyByIdAndAssetTypeId(
    authInfo: AuthInfo,
    propertyId: string,
    assetTypeId: string,
    data: UpdatePropertyDefReqClassDto,
  ): Promise<UnitedPropertyDto> {
    // Try to fetch the property
    const prop = this.propValEntityRepo
      .createQueryBuilder('propVals')
      .where('propVals.id = :propertyId', { propertyId })
      .andWhere('propVals.tenantId = :tenantIdVal', { tenantIdVal: authInfo.tenantId })
      .leftJoinAndSelect('propVals.definition', 'def')
      .andWhere('def.asset_type_id = :assetTypeId', { assetTypeId })
      .andWhere('def.tenantId = :tenantId', { tenantId: authInfo.tenantId });
    const ret = await prop.getOne();

    if (!ret) {
      throw new NotFoundException(`No property "${propertyId}" for "${assetTypeId}"`);
    }

    // Update the relevant data of the definition
    if (has(data, 'name') || has(data, 'key') || has(data, 'type')) {
      if (has(data, 'name') && data.name) {
        ret.definition.name = data.name;
      }

      if (has(data, 'key') && data.key) {
        ret.definition.key = data.key;
      }

      if (has(data, 'type') && data.type) {
        ret.definition.type = data.type;
      }

      ret.definition.tenantId = authInfo.tenantId;

      await this.propDefEntityRepo.save(ret.definition);
    }

    // Update the value
    if (has(data, 'isHidden') && data.isHidden !== undefined) {
      ret.isHidden = data.isHidden;
    }

    if (has(data, 'isRequired') && data.isRequired !== undefined) {
      ret.isRequired = data.isRequired;
    }

    if (has(data, 'position') && data.position !== undefined) {
      ret.position = data.position;
    }

    if (has(data, 'value') && data.value) {
      ret.value = data.value;
    }

    ret.tenantId = authInfo.tenantId;

    await this.propValEntityRepo.save(ret);

    // Return the freshly fetched, updated property
    return this.getPropertyByAssetTypeId(authInfo, assetTypeId, propertyId);
  }

  /**
   * Updates the property data of an `Asset`
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function only to the data of the tenant indicated by
   * `authInfo.tenantId`
   * @param propertyId The id of the property for which the data
   * should be updated
   * @param assetId The id of the `Asset` for which the property
   * data should be updated
   * @param data The actual update data
   * @param em Optional EntityManage to use this function from
   * within a transaction
   * @returns The updated property
   */
  async patchPropertyByIdAndAssetId(
    authInfo: AuthInfo,
    propertyId: string,
    assetId: string,
    data: UpdatePropertyValReqDto,
    em?: EntityManager,
  ): Promise<UnitedPropertyDto> {
    let propValRepo = this.propValEntityRepo;
    if (em) {
      propValRepo = em.getRepository<AssetPropertyValueEntity>(AssetPropertyValueEntity);
    }

    const prop = await propValRepo.findOne({
      id: propertyId,
      tenantId: authInfo.tenantId,
      assetId,
    });

    if (!prop) {
      throw new NotFoundException(`No such property`);
    }

    // Update all the data
    for (const key in data) {
      set(prop, key, get(data, key));
    }

    // Just to be on the safe side, overwrite the essential
    // data if it has been modified (which should not be possible)
    prop.tenantId = authInfo.tenantId;
    prop.id = propertyId;

    // We know, that we updated stuff if this is true
    if (Object.keys(data).length) {
      await propValRepo.save(prop);
    }

    return this.getPropertyByAssetId(authInfo, assetId, propertyId, em);
  }

  /**
   * Cleans-up the property value data overwrite for the given asset.
   * By "clean-up" it is meant that the values are set to NULL, so that
   * the original values from the definition are used again. But the entry
   * remains in the database since it is needed (see getPropertiesByAssetId)
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function only to the data of the tenant indicated by
   * `authInfo.tenantId`
   * @param propertyId The id of the property to clear / delete
   * @param assetId The asset id on which this property is defined
   */
  async deletePropertyOverwriteByIdAndAssetId(
    authInfo: AuthInfo,
    propertyId: string,
    assetId: string,
  ) {
    const allProps = await this.getPropertiesByAssetId(authInfo, assetId);
    const prop = allProps.find(p => p.id === propertyId);

    if (!prop) {
      throw new NotFound(`No such property`);
    }

    // Ensure that this property is not required
    if (prop.isRequired) {
      throw new ConflictException(`Cannot delete property for asset, because required`);
    }

    await this.patchPropertyByIdAndAssetId(authInfo, propertyId, assetId, {
      value: null,
      position: null,
      isHidden: null,
      isRequired: null,
    });
  }

  /**
   * Deletes the property definition for the asset type and also
   * deletes all overwrites from all assets for this property.
   * This function cleans-up all the data
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function only to the data of the tenant indicated by
   * `authInfo.tenantId`
   * @param propertyId The id of the property (supplied inside
   * the `UnitedPropertyDto` `id` field) to edit
   * @param assetTypeId The id of the `AssetType` for which this
   * property is defined
   */
  async deletePropertyDefinitionByIdAndAssetTypeId(
    authInfo: AuthInfo,
    propertyId: string,
    assetTypeId: string,
  ) {
    const stmt = this.propDefEntityRepo
      .createQueryBuilder('props')
      .where('asset_type_id = :assetTypeId', { assetTypeId })
      .andWhere('props.tenantId = :tenantId', { tenantId: authInfo.tenantId })
      .leftJoinAndSelect('props.values', 'val')
      .andWhere('val.asset_id IS NULL')
      .andWhere('val.id = :propertyId', { propertyId })
      .andWhere('val.tenantId = :tenantIdVal', { tenantIdVal: authInfo.tenantId });

    const propDef = await stmt.getOne();

    if (!propDef) {
      throw new NotFoundException(`No such property`);
    }

    await this.propDefEntityRepo.delete({ id: propDef.id });
  }

  // ---

  /**
   * Fetches the list of set properties for an asset type. This function
   * returns the raw database entities. For external use, have a look
   * at `getPropertiesByAssetTypeId(...)`
   *
   * @param authInfo The `AuthInfo` object to limit the actions
   * of this function only to the data of the tenant indicated by
   * `authInfo.tenantId`
   * @param assetTypeIds An array of ids of the `AssetType` to get the properties for
   * for
   * @param entityManager An optional argument to specify the entityManager
   * to use
   * @returns A list of properties for the asset type
   */
  private async getPropertiesByAssetTypeIdRaw(
    authInfo: AuthInfo,
    assetTypeIds: string[],
    entityManager?: EntityManager,
  ): Promise<AssetPropertyDefinitionEntity[]> {
    let repo = this.propDefEntityRepo;
    if (entityManager) {
      repo = entityManager.getRepository<AssetPropertyDefinitionEntity>(
        AssetPropertyDefinitionEntity,
      );
    }

    if (assetTypeIds.length < 1) {
      return [];
    }

    const propDefs = repo
      .createQueryBuilder('props')
      .where('props.asset_type_id IN (:assetTypeIds)', { assetTypeIds })
      .andWhere('props.tenantId = :tenantId', { tenantId: authInfo.tenantId })
      .leftJoinAndSelect('props.values', 'val')
      .andWhere('val.asset_id IS NULL')
      .andWhere('val.tenantId = :tenantIdVals', { tenantIdVals: authInfo.tenantId })
      .orderBy('val.position, props.key', 'ASC');
    return await propDefs.getMany();
  }

  private santizePropertyKey(key: string): string {
    return `${key}`.replace(/[^a-zA-Z0-9\-_]/, '').trim();
  }
}
