import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { MultilangValue } from 'shared/common/models';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { DocumentLinkEntity } from './document-link.entity';
import { DocumentTypeEntity } from './document-type.entity';

@Entity({ name: `${TABLE_PREFIX}_document_entity` })
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiResponseProperty()
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  @ApiResponseProperty()
  @Exclude()
  tenantId!: string;

  @CreateDateColumn()
  @ApiResponseProperty()
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiResponseProperty()
  updatedAt!: Date;

  @Column({ type: 'char', length: 36 })
  @ApiResponseProperty()
  createdBy!: string;

  @Column({ type: 'json' })
  @ApiProperty()
  name!: MultilangValue;

  @Column()
  @ApiProperty()
  fileId!: string;

  @ManyToOne(() => DocumentTypeEntity, type => type.documents, { eager: true })
  @Exclude()
  type!: DocumentTypeEntity;

  @OneToMany(() => DocumentLinkEntity, link => link.document)
  links!: DocumentLinkEntity[];

  @Expose()
  @ApiProperty()
  get typeId(): string {
    return this.type.id;
  }
}
