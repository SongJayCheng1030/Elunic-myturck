import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class Organization1655841014960 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_organization_entity`,
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            isGenerated: false,
          },
          {
            name: 'tenant_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'owner_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'KEY___organization_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
        uniques: [
          {
            name: 'UNIQ___organization_entity___id',
            columnNames: ['tenant_id', 'id'],
          },
        ],
        foreignKeys: [],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_organization_entity`);
  }
}
