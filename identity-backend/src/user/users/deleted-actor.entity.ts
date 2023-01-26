import { Column, Entity, Generated, Index, PrimaryColumn } from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';

@Entity({ name: `${TABLE_PREFIX}_deleted_actor_entity` })
export class DeletedActorEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  @Index()
  tenantId!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  @Index()
  refId!: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  displayName!: string;

  @Column({ type: 'char', length: 14, nullable: false })
  type!: 'api' | 'user' | 'unknown';

  @Column({ type: 'datetime', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'char', length: 36, nullable: true })
  createdBy!: string | null;
}
