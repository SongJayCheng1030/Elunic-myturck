import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, Generated, Index, OneToMany, PrimaryColumn, Unique } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { GrafanaTileEntity } from '../grafana-buildingset/grafana-tile.entity';

@Entity({ name: `${TABLE_PREFIX}_machine_variable_entity` })
@Unique('UNIQ___name_asset_type', ['tenantId', 'name', 'assetTypeId'])
export class MachineVariableEntity {
  @ApiResponseProperty()
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  @Index('KEY___machine_variable_entity___tenant_id')
  @Exclude({ toPlainOnly: true })
  tenantId!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @ApiProperty()
  @Column({ type: 'char', length: 36, nullable: false })
  parameterId!: string;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255 })
  unit?: string;

  @ApiProperty()
  @Column({ type: 'char', length: 36, nullable: false })
  @Index()
  assetTypeId!: string;

  @ApiResponseProperty()
  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ApiResponseProperty()
  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @OneToMany(() => GrafanaTileEntity, grafanaTile => grafanaTile.machineVariable, {
    onDelete: 'SET NULL',
  })
  grafanaTiles!: GrafanaTileEntity[];
}
