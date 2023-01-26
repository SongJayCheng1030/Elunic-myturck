import {
  AssetDto,
  AssetTypeDto,
  ISA95EquipmentHierarchyModelElement,
  MultilangValue,
} from 'shared/common/models';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Generated,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import { AssetEntity } from '../asset/asset.entity';
import { AssetPropertyDefinitionEntity } from '../asset-property/asset-property-definition.entity';
import { TABLE_PREFIX } from '../definitions';

@Entity({ name: `${TABLE_PREFIX}_asset_type_entity` })
export class AssetTypeEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  @Index()
  tenantId!: string;

  @Column({ type: 'tinyint', nullable: false, default: 0 })
  isBuiltIn!: boolean;

  @Column({ type: 'json', nullable: false })
  name!: MultilangValue;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToOne(_ => AssetTypeEntity, assetType => assetType.id, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  extendsType!: AssetTypeEntity | null;

  @Column({ type: 'char', length: 36, nullable: true })
  extendsTypeId!: string | null;

  @Column({
    type: 'enum',
    nullable: false,
    enum: ISA95EquipmentHierarchyModelElement,
    default: ISA95EquipmentHierarchyModelElement.NONE,
  })
  equipmentType!: ISA95EquipmentHierarchyModelElement;

  @OneToMany(_ => AssetEntity, asset => asset.assetType)
  assets!: AssetEntity[];

  @OneToMany(_ => AssetPropertyDefinitionEntity, prop => prop.assetType)
  properties!: AssetPropertyDefinitionEntity[];

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;

  static toExternal(entity: AssetTypeEntity): AssetTypeDto {
    return {
      id: entity.id,
      isBuiltIn: !!entity.isBuiltIn,
      name: entity.name,
      description: entity.description,
      extendsType: entity.extendsType ? AssetTypeEntity.toExternal(entity.extendsType) : null,
      equipmentType: entity.equipmentType,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      ...(entity.deletedAt
        ? {
            deletedAt: entity.deletedAt.toISOString(),
            isDeleted: true,
          }
        : { isDeleted: false }),
      ...(entity.assets
        ? {
            assets: entity.assets.map(AssetEntity.toExternal) as AssetDto[],
          }
        : {}),
    };
  }
}
