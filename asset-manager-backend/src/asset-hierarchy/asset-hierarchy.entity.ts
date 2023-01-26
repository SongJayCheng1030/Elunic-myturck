import { Column, Entity, Generated, ManyToOne, PrimaryColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

@Entity({ name: `${TABLE_PREFIX}_asset_hierarchy_entity` })
export class AssetHierarchyEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @ManyToOne(_ => AssetHierarchyEntity, assetHierarchy => assetHierarchy.id, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent!: AssetHierarchyEntity | null;

  @Column({ type: 'char', length: 36, nullable: true })
  parentId!: string | null;

  @Column({ type: 'int', default: 0 })
  orderIndex!: number;

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
