import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'nestjs-joi';
import { AssetDocumentDto } from 'shared/common/models';
import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { AssetEntity } from './asset.entity';

@JoiSchemaOptions({ allowUnknown: false })
@Entity({ name: `${TABLE_PREFIX}_asset_document_entity` })
export class AssetDocumentEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  @JoiSchema(Joi.any().forbidden())
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  documentId!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  documentType!: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description!: string | null;

  @ManyToOne(_ => AssetEntity, asset => asset.documents, {
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

  static toExternal(entity: AssetDocumentEntity): AssetDocumentDto {
    return {
      id: entity.id,
      documentId: entity.documentId,
      documentType: entity.documentType || null,
      description: entity.description,
      createdAt: entity.createdAt.toISOString(),
      createdBy: entity.createdBy,
    };
  }
}
