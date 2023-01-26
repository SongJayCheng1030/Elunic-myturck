import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class StepTag1655881615958 implements MigrationInterface {
  name = 'StepTag1655881615958';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_step_tag_entity`,
        columns: [
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isPrimary: true,
          },
          {
            name: 'tenant_id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
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
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_step_tag_to_procedure_library_step`,
        columns: [
          {
            name: 'step_id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'tag_name',
            type: 'char',
            length: '255',
            isPrimary: true,
          },
          {
            name: 'tenant_id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
        ],
        foreignKeys: [
          {
            name: 'FK___step_tag_to_procedure_library_step___step___id',
            columnNames: ['step_id'],
            referencedTableName: `${TABLE_PREFIX}_procedure_library_step_entity`,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            name: 'FK___step_tag_to_procedure_library_step___tag___name',
            columnNames: ['tag_name', 'tenant_id'],
            referencedTableName: `${TABLE_PREFIX}_step_tag_entity`,
            referencedColumnNames: ['name', 'tenant_id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_step_tag_to_procedure_library_step`);

    await queryRunner.dropTable(`${TABLE_PREFIX}_step_tag_entity`);
  }
}
