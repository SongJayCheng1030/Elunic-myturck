import { ApiProperty } from '@nestjs/swagger';

import {
  AssetTreeNodeClassDto,
  AssetTreeNodeDto,
} from '../../asset-hierarchy/dto/AssetTreeNodeDto';
import { TreeTransformActionDto } from '../../asset-hierarchy/dto/TreeTransformActionDto';
import { ActivityLogEntity, ActivityLogObjectType } from '../activity-log.entity';
import { ActivityValueType } from './ActivityEventType';

export interface ActivityLogDto {
  id: string;
  objectType: string;
  activityType: string;
  createdAt: string;
  createdBy: string;
}

export interface ActivityLogAssetDto extends ActivityLogDto {
  refId: string;
  fieldKey: string | null;
  newValue: ActivityValueType | null;
  oldValue: ActivityValueType | null;
}

export interface ActivityLogAssetHierarchyRevisionDto extends ActivityLogDto {
  description?: string | null;
  renderedTree?: AssetTreeNodeDto[];
  transform?: TreeTransformActionDto;
}

export function toExternal(entity: ActivityLogEntity, full = true): ActivityLogDto {
  switch (entity.objectType) {
    case ActivityLogObjectType.ASSET_HIERARCHY:
      return {
        id: entity.id,
        objectType: ActivityLogEntity.toActivityLogObjectTypeString(entity.objectType),
        activityType: entity.activityType,
        ...(full === true ? { renderedTree: (entity.oldValue || []) as AssetTreeNodeDto[] } : {}),
        ...(full === true
          ? { transform: ((entity.newValue || {}) as unknown) as TreeTransformActionDto }
          : {}),
        createdAt: entity.createdAt.toISOString(),
        createdBy: entity.createdBy,
        description: entity.description || null,
      } as ActivityLogAssetHierarchyRevisionDto;

    case ActivityLogObjectType.ASSET_PROPERTY:
    case ActivityLogObjectType.ASSET_TYPE:
    case ActivityLogObjectType.UNKNOWN:
    case ActivityLogObjectType.ASSET:
    default:
      return {
        id: entity.id,
        objectType: ActivityLogEntity.toActivityLogObjectTypeString(entity.objectType),
        refId: entity.refId,
        activityType: entity.activityType,
        fieldKey: entity.fieldKey,
        newValue: entity.newValue || null,
        oldValue: entity.oldValue || null,
        createdAt: entity.createdAt.toISOString(),
        createdBy: entity.createdBy,
      } as ActivityLogAssetDto;
  }
}

export class ActivityLogClassDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  objectType!: string;
  @ApiProperty()
  activityType!: string;
  @ApiProperty()
  createdAt!: string;
  @ApiProperty()
  createdBy!: string;
}

export class ActivityLogAssetClassDto extends ActivityLogClassDto {
  @ApiProperty()
  refId!: string;
  @ApiProperty()
  fieldKey!: string | null;
  @ApiProperty()
  newValue!: ActivityValueType | null;
  @ApiProperty()
  oldValue!: ActivityValueType | null;
}

export class ActivityLogAssetHierarchyRevisionlassDto extends ActivityLogClassDto {
  @ApiProperty()
  description?: string | null;
  @ApiProperty({ type: () => [AssetTreeNodeClassDto] })
  renderedTree?: AssetTreeNodeClassDto[];
  @ApiProperty()
  transform?: TreeTransformActionDto;
}
