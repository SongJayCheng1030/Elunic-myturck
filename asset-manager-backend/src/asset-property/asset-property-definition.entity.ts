import { MultilangValue } from 'shared/common/models';
import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import { AssetTypeEntity } from '../asset-type/asset-type.entity';
import { TABLE_PREFIX } from '../definitions';
import { AssetPropertyValueEntity } from './asset-property-value.entity';

export enum AssetPropertyType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  FILE = 'FILE',
}

export type AssetPropertyValue = number | string | Date | boolean;

@Entity({ name: `${TABLE_PREFIX}_asset_property_def_entity` })
export class AssetPropertyDefinitionEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @Column({ type: 'varchar', nullable: false, length: 64 })
  key!: string;

  @Column({ type: 'json', nullable: false })
  name!: MultilangValue;

  @Column({
    type: 'enum',
    nullable: false,
    enum: AssetPropertyType,
    default: AssetPropertyType.STRING,
  })
  type!: AssetPropertyType;

  @ManyToOne(_ => AssetTypeEntity, assetType => assetType.properties, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  assetType!: AssetTypeEntity;

  @Column({ type: 'char', length: 36, nullable: false })
  assetTypeId!: string;

  @OneToMany(_ => AssetPropertyValueEntity, valueType => valueType.definition, { nullable: false })
  values!: AssetPropertyValueEntity[];

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
