import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class Sensor1664366205787 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_sensor_entity`,
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '255',
            isPrimary: true,
            isGenerated: false,
          },
          {
            name: 'device_id',
            type: 'char',
            length: '255',
            isPrimary: true,
            isGenerated: false,
          },
          {
            name: 'group_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['log', 'series', 'switch'],
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'KEY___sensor_entity___group_id',
            columnNames: ['group_id'],
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_sensor_entity`);
  }
}
