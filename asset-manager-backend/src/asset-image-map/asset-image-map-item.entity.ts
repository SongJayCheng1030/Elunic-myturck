import { AssetMapItemDto } from 'shared/common/models';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { AssetImageMapEntity } from './asset-image-map.entity';

@Entity({ name: `${TABLE_PREFIX}_asset_image_map_item_entity` })
export class AssetImageMapItemEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: true })
  imageId?: string | null;

  @Column({ type: 'char', length: 36, nullable: true })
  assetId?: string | null;

  @Column({ default: 0 })
  left!: number;

  @Column({ default: 0 })
  top!: number;

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @ManyToOne(_ => AssetImageMapEntity, imageMap => imageMap.mapItems)
  @JoinColumn()
  imageMap?: AssetImageMapEntity;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  static toExternal(entity: AssetImageMapItemEntity): AssetMapItemDto {
    return {
      id: entity.id,
      createdAt: entity?.createdAt ? entity.createdAt.toISOString() : null,
      updatedAt: entity?.updatedAt ? entity.updatedAt.toISOString() : null,
      assetId: entity.assetId,
      imageId: entity.imageId,
      top: entity.top,
      left: entity.left,
    };
  }
}
