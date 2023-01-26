import { Exclude } from 'class-transformer';
import { DocumentActivityType } from 'shared/common/models';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

@Entity({ name: `${TABLE_PREFIX}_activity_log_entity` })
export class ActivityLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  @Exclude()
  tenantId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'char', length: 36 })
  createdBy!: string;

  @Column()
  refId!: string;

  @Column({ type: 'enum', enum: DocumentActivityType })
  type!: DocumentActivityType;
}
