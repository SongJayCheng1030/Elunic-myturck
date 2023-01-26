import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialAssetPropertyValueEntity1615367387600 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_asset_property_val_entity`,
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
            name: 'definition_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'asset_id',
            type: 'char',
            length: '36',
            isNullable: true,
          },
          {
            name: 'value',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'position',
            type: 'int',
            isNullable: true,
            default: null,
          },
          {
            name: 'is_hidden',
            type: 'tinyint',
            isNullable: true,
            default: null,
          },
          {
            name: 'is_required',
            type: 'tinyint',
            isNullable: true,
            default: null,
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
            name: 'KEY___asset_property_val_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
        uniques: [
          {
            name: 'UNIQ___asset_property_val_entity___one-def-per-asset',
            columnNames: ['asset_id', 'definition_id'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK___asset_property_val_entity___asset_property_def_entity___id',
            columnNames: ['definition_id'],
            referencedTableName: `${TABLE_PREFIX}_asset_property_def_entity`,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            name: 'FK___asset_property_val_entity___asset_entity___id',
            columnNames: ['asset_id'],
            referencedTableName: `${TABLE_PREFIX}_asset_entity`,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_asset_property_val_entity`);
  }
}
