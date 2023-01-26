import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class DataSink1657055073748 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_data_sink_entity`,
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '255',
            isPrimary: true,
            isGenerated: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'config',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'device_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            name: 'FK___data_sink_entity___device_entity___id',
            columnNames: ['device_id'],
            referencedTableName: `${TABLE_PREFIX}_device_entity`,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_data_sink_entity`);
  }
}
