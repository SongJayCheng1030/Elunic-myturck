import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialTenant1613397895460 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_tenant_entity`,
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            generationStrategy: 'uuid',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '64',
            isNullable: false,
          },
          {
            name: 'enabled',
            type: 'tinyint',
            isNullable: false,
            default: 1,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            default: null,
          },
          {
            name: 'owner_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'created_by',
            type: 'char',
            length: '36',
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
        indices: [],
        uniques: [],
        foreignKeys: [],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_tenant_entity`);
  }
}
