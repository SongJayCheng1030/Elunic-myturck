import { MultilangValue } from 'shared/common/models';
import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { FacadeDto } from './dto/FacadeDto';

@Entity({ name: `${TABLE_PREFIX}_facade_entity` })
export class FacadeEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @Column({ type: 'json', nullable: false })
  name!: MultilangValue;

  @Column({ type: 'varchar', length: 50, nullable: false })
  type!: 'GRAFANA_BUILDING_SET' | 'OEE_MONITORING' | 'MAINTENANCE_MONITORING';

  @Column({ type: 'varchar', length: 100, nullable: false })
  urlPath!: string;

  @Column({ type: 'text', nullable: false })
  iconUrl!: string;

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  // ---

  static toDto(entity: FacadeEntity): FacadeDto {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      urlPath: entity.urlPath,
      iconUrl: entity.iconUrl,
    };
  }
}
