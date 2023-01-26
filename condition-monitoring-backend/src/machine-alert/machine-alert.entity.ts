import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export enum SeverityType {
  WARNING = 'warning',
  ERROR = 'error',
}

@Entity({ name: `${TABLE_PREFIX}_machine_alert_entity` })
export class MachineAlertEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'char', length: 36, nullable: false })
  tenantId!: string;

  @Column({ type: 'enum', nullable: false, enum: SeverityType })
  severity!: SeverityType;

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @Column({ type: 'varchar', nullable: false, length: 255 })
  code!: string;

  @Column({ type: 'varchar', nullable: false, length: 1024 })
  text!: string;
}
