import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class MachineVariableColumns1664882629619 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(`${TABLE_PREFIX}_procedure_step_entity`, [
      new TableColumn({
        name: 'machine_variable_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
        default: null,
      }),
      new TableColumn({
        name: 'range_from',
        type: 'int',
        isNullable: true,
        default: null,
      }),
      new TableColumn({
        name: 'range_to',
        type: 'int',
        isNullable: true,
        default: null,
      }),
    ]);

    await queryRunner.addColumns(`${TABLE_PREFIX}_procedure_library_step_entity`, [
      new TableColumn({
        name: 'machine_variable_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
        default: null,
      }),
      new TableColumn({
        name: 'range_from',
        type: 'int',
        isNullable: true,
        default: null,
      }),
      new TableColumn({
        name: 'range_to',
        type: 'int',
        isNullable: true,
        default: null,
      }),
    ]);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(`${TABLE_PREFIX}_procedure_step_entity`, [
      'machine_variable_id',
      'range_from',
      'range_to',
    ]);

    await queryRunner.dropColumns(`${TABLE_PREFIX}_procedure_library_step_entity`, [
      'machine_variable_id',
      'range_from',
      'range_to',
    ]);
  }
}
