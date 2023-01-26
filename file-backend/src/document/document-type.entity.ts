import { Exclude } from 'class-transformer';
import { MultilangValue } from 'shared/common/models';
import { TABLE_PREFIX } from 'src/definitions';
import { DocumentEntity } from 'src/document/document.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: `${TABLE_PREFIX}_document_type_entity` })
@Unique(['tenantId', 'resourceId'])
export class DocumentTypeEntity {
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

  @Column({ type: 'json' })
  name!: MultilangValue;

  @Column({ type: 'char', length: 255, nullable: true, default: null })
  resourceId?: string | null;

  @OneToMany(() => DocumentEntity, doc => doc.type)
  documents!: DocumentEntity[];
}
