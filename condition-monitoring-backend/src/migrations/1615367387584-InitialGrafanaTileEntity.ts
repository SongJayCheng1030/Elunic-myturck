import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialGrafanaTileEntity1615367387584 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_gf_tile_entity`,
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
            name: 'facade_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'parameter',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'is_magic_tile',
            type: 'tinyint',
            isNullable: false,
            default: 0,
          },
          {
            name: 'asset_id',
            type: 'char',
            length: '36',
            isNullable: true,
          },
          {
            name: 'asset_type_id',
            type: 'char',
            length: '36',
            isNullable: true,
          },
          {
            name: 'gf_dashboard_id',
            type: 'char',
            length: '20',
            isNullable: false,
          },
          {
            name: 'gf_panel_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'width_units',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'height_units',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'order_index',
            type: 'int',
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
            name: 'IDX_07926581ea4388569b1ade4849',
            columnNames: [`tenant_id`, `asset_id`, `asset_type_id`],
          },
        ],
        uniques: [],
        foreignKeys: [],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_gf_tile_entity`);
  }
}
