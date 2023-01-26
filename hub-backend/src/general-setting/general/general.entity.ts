import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';

@Entity({ name: TABLE_PREFIX + 'general_settings_entity' })
export class GeneralEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  // @Column()
  // primaryColor!: string;

  // @Column()
  // bgColor!: string;

  // @Column()
  // light!: boolean;

  // @Column()
  // bgImage!: string;

  @Column()
  key!: string;

  @Column()
  value!: string;

  @Column({ type: 'char', length: 36, nullable: true })
  @Index()
  tenantId!: string;
}
