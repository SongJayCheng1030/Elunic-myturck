import { Column, Entity, Generated, PrimaryColumn, Unique } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { SettingDto } from './dto/SettingDto';

@Entity({ name: `${TABLE_PREFIX}_settings_entity` })
@Unique(['key', 'tenantId'])
export class SettingEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  key!: string;

  @Column({ type: 'text' })
  value!: string | null;

  @Column({ type: 'text' })
  description!: string | null;

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

  static toExternal(entity: SettingEntity): SettingDto {
    return {
      key: `${entity.key || ''}`.toUpperCase(),
      value: `${entity.value || ''}`,
      description: `${entity.description || ''}`,
    };
  }
}
