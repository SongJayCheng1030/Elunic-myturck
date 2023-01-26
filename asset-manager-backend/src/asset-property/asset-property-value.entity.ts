import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';

import { AssetEntity } from '../asset/asset.entity';
import { TABLE_PREFIX } from '../definitions';
import {
  AssetPropertyDefinitionEntity,
  AssetPropertyValue,
} from './asset-property-definition.entity';

@Entity({ name: `${TABLE_PREFIX}_asset_property_val_entity` })
@Unique(['asset', 'definition'])
export class AssetPropertyValueEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  /**
   * Link to the defition of this property
   */
  @ManyToOne(_ => AssetPropertyDefinitionEntity, defEntity => defEntity.values, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  definition!: AssetPropertyDefinitionEntity;

  /**
   * The asset entity for which this value is created
   * (overwrite) or `null` if it is a default value for
   * the property
   */
  @ManyToOne(_ => AssetEntity, asset => asset.properties, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  asset!: AssetEntity | null;

  @Column({ type: 'char', length: 36, nullable: true })
  assetId!: string;

  @Column({ type: 'json', nullable: true })
  value!: AssetPropertyValue | null;

  @Column({ type: 'int', nullable: true, default: null })
  position!: number | null;

  /**
   * This field defines, if this property is displayed
   */
  @Column({ type: 'tinyint', nullable: true, default: null })
  isHidden!: boolean | null;

  @Column({ type: 'tinyint', nullable: true, default: null })
  isRequired!: boolean | null;

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
