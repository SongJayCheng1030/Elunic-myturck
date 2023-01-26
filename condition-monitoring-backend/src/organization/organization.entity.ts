import { Column, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { DeviceEntity } from '../device/device.entity';

@Entity({ name: `${TABLE_PREFIX}_organization_entity` })
@Index(['id', 'tenantId'], { unique: true })
export class OrganizationEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ type: 'char', length: 36 })
  @Index()
  tenantId!: string;

  @Column({ type: 'char', length: 36 })
  ownerId!: string;

  @OneToMany(() => DeviceEntity, device => device.organization, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  devices!: DeviceEntity[];
}
