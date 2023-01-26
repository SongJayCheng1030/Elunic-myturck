import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Series1657055073748 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'series',
        // The order of primary columns here is very important because it defines an
        // index optimized for common queries on time series data.
        // Most important here is time column coming last because we will often
        // search for time ranges, the other columns however we will search mostly for equality.
        columns: [
          {
            name: 'device_id',
            type: 'varchar',
            length: '255',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'parameter_id',
            type: 'varchar',
            length: '255',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'aggregate',
            type: 'varchar',
            length: '255',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'time',
            type: 'datetime(6)',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'aggregate_interval',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'value',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'KEY___series___device_id___time',
            columnNames: ['device_id', 'time'],
          },
          {
            name: 'KEY___series___device_id___parameter_id___time',
            columnNames: ['device_id', 'parameter_id', 'time'],
          },
          {
            name: 'KEY___series___device_id___aggregate___time',
            columnNames: ['device_id', 'aggregate', 'time'],
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('series');
  }
}
