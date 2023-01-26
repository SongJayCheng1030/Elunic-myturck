import { Column, Entity, Generated, OneToMany, PrimaryColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { TenantSettingsEntity } from '../tenant-settings/tenant-settings.entity';
import { TenantDto } from './dto/TenantDto';

@Entity({ name: `${TABLE_PREFIX}_tenant_entity` })
export class TenantEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64, nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'tinyint', nullable: false, default: 1 })
  enabled!: boolean;

  @Column({ type: 'char', length: 36, nullable: true })
  ownerId!: string | null;

  @OneToMany(() => TenantSettingsEntity, settings => settings.tenant)
  tenantSettings!: TenantSettingsEntity[];

  @Column({ type: 'char', length: 36, nullable: false })
  createdBy!: string;

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  // ---

  static toExternal(entity: TenantEntity): TenantDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description || null,
      enabled: entity.enabled === true,
      ownerId: entity.ownerId || null,
      tenantSettings: entity.tenantSettings?.map(TenantSettingsEntity.toExternal),
      createdBy: entity.createdBy || null,
      updatedAt: entity.updatedAt.toISOString(),
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
