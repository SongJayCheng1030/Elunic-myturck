import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialAssetImageMapItemEntity1648725329121 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_asset_image_map_item_entity`,
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            generationStrategy: 'uuid',
            isPrimary: true,
          },
          {
            name: 'image_id',
            type: 'char',
            length: '36',
            isNullable: true,
          },
          {
            name: 'asset_id',
            type: 'char',
            length: '36',
            isNullable: true,
          },
          {
            name: 'image_map_id',
            type: 'char',
            length: '36',
            isNullable: true,
          },
          {
            name: 'left',
            type: 'int',
            default: 0,
            isNullable: true,
          },
          {
            name: 'top',
            type: 'int',
            default: 0,
            isNullable: true,
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
        indices: [],
        uniques: [],
        foreignKeys: [],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_asset_image_map_item_entity`);
  }
}
