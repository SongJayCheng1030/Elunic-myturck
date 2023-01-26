import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class ProcedureLibraryStep1655724824011 implements MigrationInterface {
  name = 'ProcedureLibraryStep1655724824011';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_procedure_library_step_entity`,
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            generationStrategy: 'uuid',
            isPrimary: true,
          },
          {
            name: 'tenant_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'mandatory',
            type: 'tinyint',
            isNullable: false,
          },
          {
            name: 'skippable',
            type: 'tinyint',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['description', 'numeric_input', 'text_input', 'checkbox'],
            isNullable: false,
          },
          {
            name: 'key',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'json',
            isNullable: false,
          },
        ],
        uniques: [
          {
            name: 'UNIQ___procedure_library_step_entity_name',
            columnNames: ['tenant_id', 'name'],
          },
          {
            name: 'UNIQ___procedure_library_step_entity_key',
            columnNames: ['tenant_id', 'key'],
          },
        ],
        indices: [
          {
            name: 'KEY___procedure_library_step_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
      }),
    );

    await queryRunner.addColumn(
      `${TABLE_PREFIX}_procedure_step_entity`,
      new TableColumn({
        name: 'parent_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
        default: null,
      }),
    );

    await queryRunner.createForeignKey(
      `${TABLE_PREFIX}_procedure_step_entity`,
      new TableForeignKey({
        name: 'FK___procedure_step_entity___parent___id',
        columnNames: ['parent_id'],
        referencedTableName: `${TABLE_PREFIX}_procedure_library_step_entity`,
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      `${TABLE_PREFIX}_procedure_step_entity`,
      'FK___procedure_step_entity___parent___id',
    );

    await queryRunner.dropColumn(`${TABLE_PREFIX}_procedure_step_entity`, 'parent_id');

    await queryRunner.dropTable(`${TABLE_PREFIX}_procedure_library_step_entity`);
  }
}
