import { Column, Entity, Generated, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';

import { AssetEntity } from '../asset/asset.entity';
import { TABLE_PREFIX } from '../definitions';

export class AssetGroupProperty {
  key!: string;
  name!: string;
  value!: string | boolean | number;
  type!: 'string' | 'boolean' | 'number';
}

@Entity({ name: `${TABLE_PREFIX}_asset_group_entity` })
export class AssetGroupEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @ManyToMany(_ => AssetEntity)
  @JoinTable({ name: `${TABLE_PREFIX}_asset_group__asset_rel` })
  assets!: AssetEntity[];

  @Column({ type: 'json', nullable: true })
  properties!: AssetGroupProperty[];

  @Column({ type: 'varchar', length: 128, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  description!: string;

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
