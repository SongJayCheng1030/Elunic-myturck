import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialAssetPropertyDefinitionEntity1615367387598 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_asset_property_def_entity`,
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
            name: 'key',
            type: 'varchar',
            length: '64',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['STRING', 'NUMBER', 'DATE', 'BOOLEAN', 'FILE'],
            default: `'STRING'`,
            isNullable: false,
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
            name: 'KEY___asset_property_def___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
        uniques: [],
        foreignKeys: [
          {
            name: 'FK___asset_property_def___asset_type_entity___id',
            columnNames: ['asset_type_id'],
            referencedTableName: `${TABLE_PREFIX}_asset_type_entity`,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_asset_property_def_entity`);
  }
}
