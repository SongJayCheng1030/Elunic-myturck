import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryColumn, RelationId } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { OrganizationEntity } from '../organization/organization.entity';
import { DataSinkEntity } from './data-sink.entity';

@Entity({ name: `${TABLE_PREFIX}_device_entity` })
export class DeviceEntity {
  @PrimaryColumn({ type: 'char', length: 255 })
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'char', length: 36, default: null, nullable: true })
  assetId!: string | null;

  @RelationId((org: DeviceEntity) => org.organization)
  organizationId!: string;

  @ManyToOne(() => OrganizationEntity, org => org.devices, { eager: true })
  organization!: OrganizationEntity;

  @OneToMany(() => DataSinkEntity, sink => sink.device, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  dataSinks!: DataSinkEntity[];
}
