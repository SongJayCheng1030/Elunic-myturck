import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class Initialize1654081336903 implements MigrationInterface {
  name = 'Initialize1654081336903';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_procedure_entity`,
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
            name: 'asset_type_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'interval',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'interval_unit',
            type: 'enum',
            enum: ['hours', 'days', 'months', 'years'],
            isNullable: false,
          },
        ],
        uniques: [
          {
            name: 'UNIQ___procedure_entity_name',
            columnNames: ['tenant_id', 'name'],
          },
        ],
        indices: [
          {
            name: 'KEY___procedure_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_procedure_step_entity`,
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
          {
            name: 'position',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'procedure_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
        ],
        uniques: [
          {
            name: 'UNIQ___procedure_step_entity_procedure_name',
            columnNames: ['tenant_id', 'procedure_id', 'name'],
          },
          {
            name: 'UNIQ___procedure_step_entity_procedure_key',
            columnNames: ['tenant_id', 'procedure_id', 'key'],
          },
        ],
        indices: [
          {
            name: 'KEY___procedure_step_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_execution_step_result_entity`,
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
            name: 'value',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ok', 'error', 'skipped'],
            isNullable: false,
          },
          {
            name: 'execution_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'step_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'KEY___execution_step_result_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_execution_entity`,
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
            name: 'due_date',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'completed_by',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'state',
            type: 'enum',
            enum: ['open', 'due_soon', 'over_due', 'completed', 'partially_completed'],
            isNullable: false,
          },
          {
            name: 'assignment_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'KEY___execution_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_asset_assignment_entity`,
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
            name: 'asset_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'active',
            type: 'tinyint',
            default: 1,
            isNullable: false,
          },
          {
            name: 'procedure_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
        ],
        uniques: [
          {
            name: 'UNIQ___asset_assignment_entity_asset_procedure',
            columnNames: ['tenant_id', 'asset_id', 'procedure_id'],
          },
        ],
        indices: [
          {
            name: 'KEY___asset_assignment_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      `${TABLE_PREFIX}_procedure_step_entity`,
      new TableForeignKey({
        name: 'FK___procedure_step_entity___procedure___id',
        columnNames: ['procedure_id'],
        referencedTableName: `${TABLE_PREFIX}_procedure_entity`,
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      `${TABLE_PREFIX}_execution_step_result_entity`,
      new TableForeignKey({
        name: 'FK___execution_step_result_entity___execution___id',
        columnNames: ['execution_id'],
        referencedTableName: `${TABLE_PREFIX}_execution_entity`,
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      `${TABLE_PREFIX}_execution_step_result_entity`,
      new TableForeignKey({
        name: 'FK___procedure_step_entity___step___id',
        columnNames: ['step_id'],
        referencedTableName: `${TABLE_PREFIX}_procedure_step_entity`,
        referencedColumnNames: ['id'],
      }),
    );

    await queryRunner.createForeignKey(
      `${TABLE_PREFIX}_execution_entity`,
      new TableForeignKey({
        name: 'FK___procedure_step_entity___assignment___id',
        columnNames: ['assignment_id'],
        referencedTableName: `${TABLE_PREFIX}_asset_assignment_entity`,
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      `${TABLE_PREFIX}_asset_assignment_entity`,
      new TableForeignKey({
        name: 'FK___asset_assignment_entity___procedure___id',
        columnNames: ['procedure_id'],
        referencedTableName: `${TABLE_PREFIX}_procedure_entity`,
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      `${TABLE_PREFIX}_asset_assignment_entity`,
      'FK___asset_assignment_entity___procedure___id',
    );

    await queryRunner.dropForeignKey(
      `${TABLE_PREFIX}_execution_entity`,
      'FK___procedure_step_entity___assignment___id',
    );

    await queryRunner.dropForeignKey(
      `${TABLE_PREFIX}_execution_step_result_entity`,
      'FK___procedure_step_entity___procedure_step___id',
    );
    await queryRunner.dropForeignKey(
      `${TABLE_PREFIX}_execution_step_result_entity`,
      'FK___execution_step_result_entity___execution_entity___id',
    );

    await queryRunner.dropForeignKey(
      `${TABLE_PREFIX}_procedure_step_entity`,
      'FK___procedure_step_entity___procedure___id',
    );

    await queryRunner.dropTable(`${TABLE_PREFIX}_asset_assignment_entity`);
    await queryRunner.dropTable(`${TABLE_PREFIX}_execution_entity`);
    await queryRunner.dropTable(`${TABLE_PREFIX}_execution_step_result_entity`);
    await queryRunner.dropTable(`${TABLE_PREFIX}_procedure_entity`);
  }
}
