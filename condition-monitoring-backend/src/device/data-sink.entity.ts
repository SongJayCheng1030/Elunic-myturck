import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { DeviceEntity } from './device.entity';

@Entity({ name: `${TABLE_PREFIX}_data_sink_entity` })
export class DataSinkEntity {
  @PrimaryColumn({ type: 'char', length: 255 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  type!: string;

  @Column({ type: 'json' })
  config!: Record<string, unknown>;

  @RelationId((sink: DataSinkEntity) => sink.device)
  deviceId!: string;

  @ManyToOne(() => DeviceEntity, device => device.dataSinks, { eager: true })
  device!: DeviceEntity;
}
