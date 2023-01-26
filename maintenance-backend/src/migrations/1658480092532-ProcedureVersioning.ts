import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class ProcedureVersioning1658480092532 implements MigrationInterface {
  name = 'ProcedureVersioning1658480092532';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(`${TABLE_PREFIX}_procedure_entity`, [
      new TableColumn({
        name: 'root_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
      new TableColumn({
        name: 'outdated_since',
        type: 'datetime',
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKey(
      `${TABLE_PREFIX}_procedure_entity`,
      new TableForeignKey({
        name: 'FK___procedure_entity___root___id',
        columnNames: ['root_id'],
        referencedTableName: `${TABLE_PREFIX}_procedure_entity`,
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.dropIndex(`${TABLE_PREFIX}_procedure_entity`, 'UNIQ___procedure_entity_name');
    await queryRunner.dropIndex(
      `${TABLE_PREFIX}_procedure_library_step_entity`,
      'UNIQ___procedure_library_step_entity_key',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      `${TABLE_PREFIX}_procedure_library_step_entity`,
      new TableIndex({
        name: 'UNIQ___procedure_library_step_entity_key',
        columnNames: ['tenant_id', 'key'],
      }),
    );
    await queryRunner.createIndex(
      `${TABLE_PREFIX}_procedure_entity`,
      new TableIndex({
        name: 'UNIQ___procedure_entity_name',
        columnNames: ['tenant_id', 'name'],
      }),
    );

    await queryRunner.dropForeignKey(
      `${TABLE_PREFIX}_procedure_entity`,
      'FK___procedure_entity___root___id',
    );

    await queryRunner.dropColumns(`${TABLE_PREFIX}_procedure_entity`, [
      'root_id',
      'outdated_since',
    ]);
  }
}
