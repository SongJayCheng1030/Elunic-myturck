import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialAssetEntity1615367387584 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_asset_entity`,
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
            type: 'json',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'image_id',
            type: 'char',
            length: '36',
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
          {
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'KEY___asset_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
        uniques: [],
        foreignKeys: [
          {
            name: 'FK___asset_entity___asset_type_entity___id',
            columnNames: ['asset_type_id'],
            referencedTableName: `${TABLE_PREFIX}_asset_type_entity`,
            referencedColumnNames: ['id'],
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_asset_entity`);
  }
}
