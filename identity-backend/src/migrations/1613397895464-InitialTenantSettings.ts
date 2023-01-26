import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialTenantSettings1613397895464 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_tenant_settings_entity`,
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
            name: 'key',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'value',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime(3)',
            default: 'CURRENT_TIMESTAMP(3)',
          },
          {
            name: 'updated_at',
            type: 'datetime(3)',
            default: 'CURRENT_TIMESTAMP(3)',
            onUpdate: 'CURRENT_TIMESTAMP(3)',
          },
        ],
        indices: [
          {
            name: 'KEY___tenant_settings_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
        uniques: [
          {
            name: 'UNIQ___tenant_settings_entity___ref_id',
            columnNames: ['tenant_id', 'key'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK___tenant_settings_entity____tenant_entity___id',
            columnNames: ['tenant_id'],
            referencedTableName: `${TABLE_PREFIX}_tenant_entity`,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_tenant_settings_entity`);
  }
}
