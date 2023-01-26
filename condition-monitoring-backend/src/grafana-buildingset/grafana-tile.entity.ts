import { Column, Entity, Generated, Index, ManyToOne, PrimaryColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { MachineVariableEntity } from '../machine-variable/machine-variable.entity';

@Entity({ name: `${TABLE_PREFIX}_gf_tile_entity` })
@Index(['tenantId', 'assetId', 'assetTypeId'])
export class GrafanaTileEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  facadeId!: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  name!: string;

  @Column({ type: 'int', nullable: false, default: 0 })
  isMagicTile!: boolean;

  @Column({ type: 'char', length: 36, nullable: true })
  assetId!: string;

  @Column({ type: 'char', length: 36, nullable: true })
  assetTypeId!: string | null;

  @Column({ type: 'char', length: 20, nullable: false })
  gfDashboardId!: string;

  @Column({ type: 'int', nullable: false })
  gfPanelId!: number;

  @Column({ type: 'int', nullable: false })
  widthUnits!: number;

  @Column({ type: 'int', nullable: false })
  heightUnits!: number;

  @Column({ type: 'int', nullable: false })
  orderIndex!: number;

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'int', nullable: true, default: 0 })
  useVars?: boolean;

  @Column({ type: 'int', nullable: true, default: 0 })
  useOwnVars?: boolean;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @ManyToOne(() => MachineVariableEntity, machineVariable => machineVariable.grafanaTiles)
  machineVariable!: MachineVariableEntity;
}
