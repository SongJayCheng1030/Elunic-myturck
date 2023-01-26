import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class Device1655841014961 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_device_entity`,
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '255',
            isPrimary: true,
            isGenerated: false,
          },
          {
            name: 'organization_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            name: 'FK___device_entity___organization_entity___id',
            columnNames: ['organization_id'],
            referencedTableName: `${TABLE_PREFIX}_organization_entity`,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_device_entity`);
  }
}
