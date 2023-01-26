import { Exclude } from 'class-transformer';
import { TABLE_PREFIX } from 'src/definitions';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { DocumentEntity } from './document.entity';

@Entity({ name: `${TABLE_PREFIX}_document_link_entity` })
@Unique(['document', 'refId'])
export class DocumentLinkEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  @Exclude()
  tenantId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'char', length: 36 })
  createdBy!: string;

  @Column()
  refId!: string;

  @Column()
  refType!: string;

  @ManyToOne(() => DocumentEntity, doc => doc.links)
  document!: DocumentEntity;
}
