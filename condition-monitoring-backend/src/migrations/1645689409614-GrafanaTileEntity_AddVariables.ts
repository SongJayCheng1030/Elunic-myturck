import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class GrafanaTileEntityAddVariables1645689409614 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(`${TABLE_PREFIX}_gf_tile_entity`, [
      new TableColumn({
        name: 'use_vars',
        type: 'tinyint',
        isNullable: true,
        default: 0,
      }),
      new TableColumn({
        name: 'use_own_vars',
        type: 'tinyint',
        isNullable: true,
        default: 0,
      }),
    ]);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropColumns(`${TABLE_PREFIX}_gf_tile_entity`, ['use_vars', 'use_own_vars']);
  }
}
