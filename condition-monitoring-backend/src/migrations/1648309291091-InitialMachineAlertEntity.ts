import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';
import { SeverityType } from '../machine-alert/machine-alert.entity';

export class InitialMachineAlertEntity1648309291091 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_machine_alert_entity`,
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            generationStrategy: 'uuid',
            isPrimary: true,
          },
          {
            name: 'tenant_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'severity',
            type: 'enum',
            enum: [SeverityType.ERROR, SeverityType.WARNING],
            isNullable: false,
          },
          {
            name: 'timestamp',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'code',
            type: 'char',
            length: '255',
            isNullable: false,
          },
          {
            name: 'text',
            type: 'text',
            length: '1024',
            isNullable: false,
          },
        ],
        indices: [],
        uniques: [],
        foreignKeys: [],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_machine_alert_entity`);
  }
}
