import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { AuthInfo } from 'shared/common/types';
import { Connection, Repository } from 'typeorm';

import { AssetService } from '../asset/asset.service';
import { AssetHierarchyEntity } from './asset-hierarchy.entity';
import { AssetHierarchyBuilder } from './asset-hierarchy-builder';
import { AssetTreeNodeDto } from './dto/AssetTreeNodeDto';
import { TransformType, TreeTransformActionDto } from './dto/TreeTransformActionDto';
import NodeCache = require('node-cache');

import { ActivityLogObjectType } from '../activity-log/activity-log.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActivityEventType, ActivityValueType } from '../activity-log/dto/ActivityEventType';
import { TREE_CACHE_KEY, TREE_CACHE_TIME } from '../definitions';

/**
 * Main service which handles all actions around the asset
 * hierarchy and asset tree and also takes care of asset
 * revisions.
 */
@Injectable()
export class AssetHierarchyService {
  /**
   * Cache for the different generated asset trees. Contains
   * one asset tree per tenant
   */
  private treeCache: NodeCache;

  constructor(
    @InjectRepository(AssetHierarchyEntity)
    private readonly assetHierarchyRepo: Repository<AssetHierarchyEntity>,
    private readonly assetService: AssetService,
    private readonly activityLogService: ActivityLogService,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    this.treeCache = new NodeCache({ stdTTL: TREE_CACHE_TIME / 1000 });
  }

  /**
   * Fetches the asset tree for the current tenant and applies
   * caching if enabled (by default)
   *
   * @param authInfo Clears the cached asset tree for a singular
   * tenant or on `null` for all tenants
   * @param cached If the asset tree should be fetched from cache
   * if `true` otherwise it is computed
   */
  async getAssetTree(authInfo: AuthInfo, cached = false): Promise<AssetTreeNodeDto[]> {
    if (cached) {
      return this.fetchAssetTreeCached(authInfo);
    } else {
      return this.fetchAssetTree(authInfo, this.assetHierarchyRepo);
    }
  }

  /**
   * Executes a set of hierarchy transform instructions for a given
   * tenant on the current hierarchy state and also creates a new
   * tree revision after successfully executing the operation. If
   * however an error occurs nothing is changed at all (transaction).
   * Errors could be:
   *  - ids referenced which do not belong to an asset
   *  - loop or island is formed inside the tree after execution
   *  - general database errors while executing
   *
   * @param authInfo Clears the cached asset tree for a singular
   * tenant or on `null` for all tenants
   * @param transform All transformations to execute
   */
  async applyHierarchyTransformation(authInfo: AuthInfo, transform: TreeTransformActionDto) {
    // Run a pre-flight check if all the referenced asset ids are existing
    // by first collecting all mentioned ids and then ...
    let allIdsReferenced: string[] = [];
    for (const action of transform.actions) {
      allIdsReferenced.push(action.id);

      if (action.childOf) {
        allIdsReferenced.push(action.childOf);
      }

      if (action.order) {
        allIdsReferenced = allIdsReferenced.concat(action.order);
      }
    }

    // ... checking if they are all existing
    await this.assetService.checkIfAssetsExistByIdOrFail(authInfo, allIdsReferenced);

    // Perform the actual data manipulation
    return this.connection.transaction(async entityManager => {
      const hierarchyRepo = entityManager.getRepository(AssetHierarchyEntity);

      // For all actions requested
      for (let i = 0; i < transform.actions.length; i++) {
        const action = transform.actions[i];

        // Perform the requested action on the tree
        switch (action.type) {
          case TransformType.CHILD_OF:
            await this.setAssetChildOfAssetById(
              authInfo,
              hierarchyRepo,
              action.id,
              action.childOf || null,
            );
            break;

          case TransformType.DELETE:
            await this.deleteAssetFromTreeById(authInfo, hierarchyRepo, action.id);
            break;

          default:
            // This should not happen since the data is checked
            // in the controller before this function is called.
            // If this exception is thrown, there might be another
            // path in your code how the requests are coming to here
            throw new BadRequestException(`Unkown tree operation: ${action.type}`);
        }

        // Update the order only if provided and at least two elements
        if (Array.isArray(action.order) && action.order.length > 1) {
          await this.applyHierarchyOrder(authInfo, hierarchyRepo, action.order);
        }
      }

      // If success, create a new revision
      await this.activityLogService.create(
        authInfo,
        ActivityLogObjectType.ASSET_HIERARCHY,
        ActivityEventType.CREATED,
        null,
        null,
        ((await this.fetchAssetTree(authInfo, hierarchyRepo)) as unknown) as ActivityValueType,
        (transform as unknown) as ActivityValueType,
        transform.description,
        entityManager,
      );
    });
  }

  /**
   * Clears the cached asset tree for the tenant identified by
   * `authInfo.tenantId` or clears all cached asset trees
   * (across all tenants) if `null` is provided
   *
   * @param authInfo Clears the cached asset tree for a singular
   * tenant or on `null` for all tenants
   */
  clearCache(authInfo: AuthInfo | null) {
    if (!authInfo) {
      this.treeCache.flushAll();
      return;
    }

    const key = `${TREE_CACHE_KEY}_TENANT_${authInfo.tenantId}`;
    this.treeCache.del(key);
  }

  // ---

  /**
   * Moves an asset inside the tree to a new parent or adds
   * a not contained asset to the tree
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param repo Repo to execute on (required for transaction)
   * @param assetId Id of the asset to modify
   * @param newParentId New parent or `null` if new root node
   */
  private async setAssetChildOfAssetById(
    authInfo: AuthInfo,
    repo: Repository<AssetHierarchyEntity>,
    assetId: string,
    newParentId: string | null,
  ) {
    // Ensure that we not assign ourself as parent
    if (assetId === newParentId) {
      throw new ConflictException(`A asset cannot be set as its own child.`);
    }

    // Find the possibly existing entry
    let exists = await repo.findOne({
      where: {
        id: assetId,
        tenantId: authInfo.tenantId,
      },
    });

    // If not yet existing, create
    if (!exists) {
      exists = new AssetHierarchyEntity();
      exists.id = assetId;
    }

    // Update the parentId and save
    exists.parentId = newParentId || null;
    exists.tenantId = authInfo.tenantId;
    await repo.save(exists);

    // Build the tree: if any loop etc. is contained
    // this will result in an error and cause the transaction
    // to fail and persist nothing
    await this.fetchAssetTree(authInfo, repo, false);

    this.clearCache(authInfo);
  }

  /**
   * Deletes an asset and all it's children from the tree
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param repo Repo to execute on (required for transaction)
   * @param assetId Id of the asset to delete from the tree
   */
  private async deleteAssetFromTreeById(
    authInfo: AuthInfo,
    repo: Repository<AssetHierarchyEntity>,
    assetId: string,
  ) {
    // Just remove the entry from the hierarchy table to
    // remove it from the tree. The CASCADE will take care
    // of all children
    repo.delete({
      id: assetId,
      tenantId: authInfo.tenantId,
    });

    this.clearCache(authInfo);
  }

  /**
   * Applies the order information to the listed assets inside the
   * hierarchy. This function will not fail if the asset does not
   * exist as an entry in the hierarchy table
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param repo Repo to execute on (required for transaction)
   * @param order Array of assets inside the tree to be ordered
   * in the, by the array, defined order
   */
  private async applyHierarchyOrder(
    authInfo: AuthInfo,
    repo: Repository<AssetHierarchyEntity>,
    order: string[],
  ) {
    for (let i = 0; i < order.length; i++) {
      await repo.update(
        {
          id: order[i],
          tenantId: authInfo.tenantId,
        },
        {
          orderIndex: i,
        },
      );
    }
  }

  /**
   * Fetches the asset tree for a given tenant and caches it as
   * defined.
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   */
  private async fetchAssetTreeCached(authInfo: AuthInfo): Promise<AssetTreeNodeDto[]> {
    const key = `${TREE_CACHE_KEY}_TENANT_${authInfo.tenantId}`;
    let tree = this.treeCache.get<AssetTreeNodeDto[]>(key);

    // If not yet cached, load the tree and cache it
    if (!tree) {
      tree = await this.fetchAssetTree(authInfo, this.assetHierarchyRepo);
      this.treeCache.set(key, tree);
    }

    return tree;
  }

  /**
   * Fetches the asset tree from the database without caching and builds
   * it up completely. The optional argument `withAssetInfo` can be used
   * to either get only the hierarchy structure or the hierarchy with the
   * full asset information
   *
   * @param authInfo Tenant information to restrict only access
   * to the data of the current tenant
   * @param repo Repo to execute on (required for transaction)
   * @param withAssetInfo By default `true`, meaning the full hierarchy
   * structure is returned by default
   */
  private async fetchAssetTree(
    authInfo: AuthInfo,
    repo: Repository<AssetHierarchyEntity>,
    withAssetInfo = true,
  ): Promise<AssetTreeNodeDto[]> {
    // Load the entire hierarchy, i.e. all nodes to assemble them
    // into a tree
    const hierarchy = await repo.find({
      where: {
        tenantId: authInfo.tenantId,
      },
      order: {
        parentId: 'ASC',
        orderIndex: 'ASC',
      },
      select: ['id', 'parentId', 'orderIndex'],
    });

    // Decide if we want to fetch the full structure with all information
    // used e.g. for returning to the user or only the structure of
    // the hierarchy, used internally
    if (withAssetInfo) {
      // Fetch also all asset information to combine it into the
      // tree
      const assets = await this.assetService.getAssetsByIdsBulk(
        authInfo,
        hierarchy.map(h => h.id),
      );
      return AssetHierarchyBuilder.build(hierarchy, assets);
    } else {
      return AssetHierarchyBuilder.check(hierarchy);
    }
  }
}
