import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialMachineVariableEntity1662544259645 implements MigrationInterface {
  name = 'InitialMachineVariableEntity1662544259645';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_machine_variable_entity`,
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            generationStrategy: 'uuid',
            isPrimary: true,
          },
          {
            name: 'tenant_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'parameter_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'asset_type_id',
            type: 'char',
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
        ],
        indices: [
          {
            name: 'KEY___machine_variable_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
          {
            name: 'KEY___machine_variable_entity___asset_type_id',
            columnNames: ['asset_type_id'],
          },
        ],
        uniques: [
          {
            name: 'UNIQ___name_asset_type',
            columnNames: ['tenant_id', 'name', 'asset_type_id'],
          },
        ],
        foreignKeys: [],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      `${TABLE_PREFIX}_machine_variable_entity`,
      'KEY___machine_variable_entity___tenant_id',
    );
    await queryRunner.dropIndex(
      `${TABLE_PREFIX}_machine_variable_entity`,
      'KEY___machine_variable_entity___asset_type_id',
    );
    await queryRunner.dropIndex(
      `${TABLE_PREFIX}_machine_variable_entity`,
      'UNIQ___name_asset_type',
    );
    await queryRunner.dropTable(`${TABLE_PREFIX}_machine_variable_entity`);
  }
}
