import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialAssetHierarchyEntity1615367387596 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_asset_hierarchy_entity`,
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
            name: 'parent_id',
            type: 'char',
            length: '36',
            isNullable: true,
          },
          {
            name: 'order_index',
            type: 'int',
            default: 0,
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
            name: 'KEY___asset_hierarchy_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
        uniques: [],
        foreignKeys: [
          {
            name: 'FK___asset_hierarchy_entity___asset_hierarchy_entity___id',
            columnNames: ['parent_id'],
            referencedTableName: `${TABLE_PREFIX}_asset_hierarchy_entity`,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            name: 'FK___asset_hierarchy_entity___asset_entity___id',
            columnNames: ['id'],
            referencedTableName: `${TABLE_PREFIX}_asset_entity`,
            referencedColumnNames: ['id'],
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_asset_hierarchy_entity`);
  }
}
