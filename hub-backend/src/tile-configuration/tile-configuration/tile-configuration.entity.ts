import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { TABLE_PREFIX } from '../../definitions';

@Entity({ name: TABLE_PREFIX + 'tile_configuration_entity' })
export class TileConfigurationEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  tileName!: string;

  @Column()
  desc!: string;

  @Column()
  appUrl!: string;

  @Column()
  iconUrl!: string;

  @Column()
  tileColor!: string;

  @Column()
  tileTextColor!: string;

  @Column()
  order!: number;

  @Column()
  show!: number;

  @Column()
  integratedView!: boolean;

  @Column({ type: 'char', length: 36, nullable: true })
  @Index()
  tenantId?: string;
}
