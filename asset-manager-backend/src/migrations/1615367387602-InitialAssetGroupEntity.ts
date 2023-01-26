import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialAssetGroupEntity1615367387602 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_asset_group_entity`,
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
            name: 'properties',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '128',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '512',
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
        indices: [],
        uniques: [],
        foreignKeys: [],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_asset_group__asset_rel`,
        columns: [
          {
            name: 'sio_assets___asset_group_entity_id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'sio_assets___asset_entity_id',
            type: 'char',
            length: '36',
            isNullable: false,
            isPrimary: true,
          },
        ],
        indices: [
          {
            name: 'KEY___sio_assets___asset_group_entity_id',
            columnNames: ['sio_assets___asset_group_entity_id'],
          },
          {
            name: 'KEY___sio_assets___asset_entity_id',
            columnNames: ['sio_assets___asset_entity_id'],
          },
        ],
        uniques: [],
        foreignKeys: [
          {
            name: 'FK___sio_assets___asset_group_entity_id',
            columnNames: ['sio_assets___asset_group_entity_id'],
            referencedTableName: `${TABLE_PREFIX}_asset_group_entity`,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            name: 'FK___sio_assets___asset_entity_id',
            columnNames: ['sio_assets___asset_entity_id'],
            referencedTableName: `${TABLE_PREFIX}_asset_entity`,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_asset_group__asset_rel`);
    await queryRunner.dropTable(`${TABLE_PREFIX}_asset_group_entity`);
  }
}
