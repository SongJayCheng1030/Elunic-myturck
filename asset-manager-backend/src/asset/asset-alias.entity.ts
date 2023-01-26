import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'nestjs-joi';
import { AssetAliasType } from 'shared/common/models';
import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { AssetEntity } from './asset.entity';
import { AssetAliasDto } from './dto/AssetDto';

@JoiSchemaOptions({ allowUnknown: false })
@Entity({ name: `${TABLE_PREFIX}_asset_alias_entity` })
@Unique(['tenantId', 'alias'])
export class AssetAliasEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  @JoiSchema(Joi.any().forbidden())
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @Column({ type: 'varchar', length: 64, nullable: false })
  alias!: string;

  @Column({
    type: 'enum',
    nullable: false,
    enum: AssetAliasType,
    default: AssetAliasType.GENERAL,
  })
  type!: AssetAliasType;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description!: string | null;

  @ManyToOne(_ => AssetEntity, asset => asset.aliases, {
    orphanedRowAction: 'delete',
  })
  @JoinColumn()
  asset!: AssetEntity;

  @Column({ type: 'char', length: 36, nullable: false })
  assetId!: string;

  @Column({ type: 'char', length: 36 })
  createdBy!: string;

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  static toExternal(entity: AssetAliasEntity): AssetAliasDto {
    return {
      id: entity.id,
      assetId: entity.assetId,
      assetName: entity.asset?.name,
      alias: entity.alias,
      type: entity.type,
      description: entity.description,
      createdAt: entity.createdAt.toISOString(),
      createdBy: entity.createdBy,
    };
  }
}
