import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tuple } from 'shared/common/models/Tuple';
import { AuthInfo } from 'shared/common/types';
import { EntityManager, Repository } from 'typeorm';

import { ActivityLogEntity } from './activity-log.entity';
import { ActivityEventType, ActivityValueType } from './dto/ActivityEventType';
import { ActivityLogQueryFilterDto } from './dto/ActivityLogQueryFilterDto';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly activityRepo: Repository<ActivityLogEntity>,
  ) {}

  async findLogsByFilter(
    authInfo: AuthInfo,
    filter: ActivityLogQueryFilterDto,
    offset: number,
    limit: number,
  ): Promise<Tuple<ActivityLogEntity[], number>> {
    // Build the filter statement
    const where = {
      ...(filter.objectType
        ? { objectType: ActivityLogEntity.toActivityLogObjectTypeNumber(filter.objectType) }
        : {}),
      ...(filter.refId ? { refId: filter.refId } : {}),
      ...(filter.id ? { id: filter.id } : {}),
      tenantId: authInfo.tenantId,
    };

    // Get all the logs
    const logs = await this.activityRepo.find({
      where,
      order: {
        createdAt: 'DESC',
      },
      skip: offset,
      take: limit,
    });

    // Count the total results for pagination
    const total = await this.activityRepo.count({
      where,
    });

    return new Tuple(logs, total);
  }

  /**
   * Creates a new activity
   *
   * @param actor Tenant information to restrict only access
   * to the data of the current tenant
   * @param eventType Type of the activity
   * @param target ID of the asset to create the activity for
   * @param fieldKey The key on which the activity operates or null
   * @param oldValue Object of the old value or null
   * @param newValue Object of the new value or null
   * @param activityRepo The activity repo if, otherwise one
   * is created from the connection
   */
  async create(
    actor: AuthInfo,
    objectType: number,
    activityType: ActivityEventType,
    target: string | null,
    fieldKey?: string | null,
    oldValue?: ActivityValueType,
    newValue?: ActivityValueType,
    description?: string | null,
    entityManager?: EntityManager,
  ) {
    let repo = this.activityRepo;
    if (entityManager) {
      repo = entityManager.getRepository(ActivityLogEntity);
    }

    await repo.insert({
      tenantId: actor.tenantId,
      objectType,
      refId: target,
      activityType,
      fieldKey: fieldKey || null,
      oldValue: oldValue || null,
      newValue: newValue || null,
      createdBy: actor.id,
      description: description || null,
    });
  }
}
