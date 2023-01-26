import { AssetImageMapDto } from 'shared/common/models';
import { Column, DeleteDateColumn, Entity, Generated, OneToMany, PrimaryColumn } from 'typeorm';

import { AssetEntity } from '../asset/asset.entity';
import { TABLE_PREFIX } from '../definitions';
import { AssetImageMapItemEntity } from './asset-image-map-item.entity';

@Entity({ name: `${TABLE_PREFIX}_asset_image_map_entity` })
export class AssetImageMapEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: true })
  backgroundImageId?: string | null;

  @OneToMany(_ => AssetEntity, asset => asset.imageMap)
  assets?: AssetEntity[];

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;

  @OneToMany(_ => AssetImageMapItemEntity, items => items.imageMap, { cascade: true, eager: true })
  mapItems?: AssetImageMapItemEntity[];

  @DeleteDateColumn()
  deletedAt?: Date;

  static toExternal(entity: AssetImageMapEntity): AssetImageMapDto {
    return {
      id: entity.id,
      createdAt: entity?.createdAt ? entity.createdAt.toISOString() : null,
      updatedAt: entity?.updatedAt ? entity.updatedAt.toISOString() : null,
      backgroundImageId: entity.backgroundImageId,
      mapItems: entity.mapItems?.map(AssetImageMapItemEntity.toExternal),
    };
  }
}
