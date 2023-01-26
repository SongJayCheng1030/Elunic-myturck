import { Column, Entity, Generated, ManyToOne, PrimaryColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { TenantEntity } from '../tenant/tenant.entity';
import { TenantSettingsDto } from './dto/TenantSettingsDto';

@Entity({ name: `${TABLE_PREFIX}_tenant_settings_entity` })
export class TenantSettingsEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @ManyToOne(() => TenantEntity, tenantEntity => tenantEntity.tenantSettings)
  tenant!: TenantEntity;

  @Column({ type: 'varchar', length: 100, nullable: false })
  key!: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  value!: string;

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  static toExternal(entity: TenantSettingsEntity): TenantSettingsDto {
    return {
      id: entity.id,
      key: entity.key,
      value: entity.value,
      updatedAt: entity.updatedAt.toISOString(),
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
