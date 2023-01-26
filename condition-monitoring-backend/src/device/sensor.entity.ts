import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { SensorType } from './device.dto';

@Entity({ name: `${TABLE_PREFIX}_sensor_entity` })
export class SensorEntity {
  @PrimaryColumn({ type: 'char', length: 255 })
  id!: string;

  @PrimaryColumn({ type: 'char', length: 255 })
  deviceId!: string;

  @Column({ type: 'char', length: 255 })
  @Index()
  groupId!: string;

  @Column({ type: 'enum', enum: SensorType })
  type!: SensorType;
}
