import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'nestjs-joi';
import { Column, Entity, Generated, JoinColumn, PrimaryColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { ActivityEventType, ActivityValueType } from './dto/ActivityEventType';

export enum ActivityLogObjectType {
  UNKNOWN = 0,
  ASSET = 100,
  ASSET_TYPE = 110,
  ASSET_HIERARCHY = 120,
  ASSET_PROPERTY = 130,
}

@JoiSchemaOptions({ allowUnknown: false })
@Entity({ name: `${TABLE_PREFIX}_activity_log_entity` })
export class ActivityLogEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  @JoiSchema(Joi.any().forbidden())
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @Column({ type: 'int', nullable: false })
  objectType!: number;

  @Column({ type: 'char', length: 36, nullable: true })
  @JoinColumn()
  refId!: string | null;

  @Column({
    type: 'enum',
    enum: ActivityEventType,
    default: ActivityEventType.GENERAL_CHANGE,
  })
  activityType!: ActivityEventType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fieldKey!: string | null;

  @Column({ type: 'json', nullable: true })
  oldValue!: ActivityValueType | null;

  @Column({ type: 'json', nullable: true })
  newValue!: ActivityValueType | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description!: string | null;

  @Column({ type: 'char', length: 36, nullable: false })
  createdBy!: string;

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  static toActivityLogObjectTypeString(num: number): string {
    const keys = Object.keys(ActivityLogObjectType);
    // @ts-ignore
    const key = keys.find(key => ActivityLogObjectType[key] === num);
    return key ? key : 'UNKNOWN';
  }

  static toActivityLogObjectTypeNumber(type: string): number {
    const key = (type || '').toUpperCase();
    // @ts-ignore
    if (typeof ActivityLogObjectType[key] !== 'undefined') {
      // @ts-ignore
      return ActivityLogObjectType[key];
    } else {
      return ActivityLogObjectType.UNKNOWN;
    }
  }
}
