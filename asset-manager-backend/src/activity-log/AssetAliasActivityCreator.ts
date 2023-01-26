import { omit } from 'lodash';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';

import { AssetAliasEntity } from '../asset/asset-alias.entity';
import { ActivityLogEntity, ActivityLogObjectType } from './activity-log.entity';
import { ActivityEventType, ActivityValueType } from './dto/ActivityEventType';

@EventSubscriber()
export class AssetAliasActivityCreator implements EntitySubscriberInterface<AssetAliasEntity> {
  listenTo() {
    return AssetAliasEntity;
  }

  async afterInsert(event: InsertEvent<AssetAliasEntity>) {
    const activityRepo = event.manager.getRepository(ActivityLogEntity);

    await activityRepo.insert({
      tenantId: event.entity.tenantId,
      objectType: ActivityLogObjectType.ASSET,
      refId: event.entity.assetId,
      activityType: ActivityEventType.COLLECTION_UPDATED,
      fieldKey: 'aliases',
      oldValue: null,
      newValue: this.cloneObjectAndFilter(event.entity),
      createdBy: event.entity.createdBy,
    });
  }

  async beforeUpdate(event: UpdateEvent<AssetAliasEntity>) {
    const activityRepo = event.manager.getRepository(ActivityLogEntity);

    if (event.entity) {
      await activityRepo.insert({
        tenantId: event.entity.tenantId,
        objectType: ActivityLogObjectType.ASSET,
        refId: event.entity.assetId,
        activityType: ActivityEventType.COLLECTION_UPDATED,
        fieldKey: 'aliases',
        oldValue: this.cloneObjectAndFilter(event.databaseEntity),
        newValue: this.cloneObjectAndFilter(event.entity as AssetAliasEntity),
        createdBy: event.entity.createdBy,
      });
    }
  }

  async beforeRemove(event: RemoveEvent<AssetAliasEntity>) {
    // TypeORM itself will call this function but with value
    // `undefined` for the fields. Therefore, if we get called
    // this way, we simply ignore it - can't do anything, anyway.
    // Our application logic then calls this function manually
    // to trigger
    if (!event.entity || !event.entityId) {
      return;
    }

    const activityRepo = event.manager.getRepository(ActivityLogEntity);

    await activityRepo.insert({
      tenantId: event.entity.tenantId,
      objectType: ActivityLogObjectType.ASSET,
      refId: event.entity.assetId,
      activityType: ActivityEventType.COLLECTION_UPDATED,
      fieldKey: 'aliases',
      oldValue: this.cloneObjectAndFilter(event.entity),
      newValue: null,
      createdBy: event.entity.createdBy,
    });
  }

  /**
   * Filters the object which is persisted in the history and
   * removes redundant fields to keep the amount of data low
   *
   * @param original The original entity data
   */
  private cloneObjectAndFilter(original: AssetAliasEntity): ActivityValueType {
    return omit(JSON.parse(JSON.stringify(original)), [
      'tenantId',
      'assetId',
      'createdAt',
      'createdBy',
    ]);
  }
}
