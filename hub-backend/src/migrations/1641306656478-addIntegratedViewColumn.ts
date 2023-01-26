import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class addIntegratedViewColumn1641306656478 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      TABLE_PREFIX + 'tile_configuration_entity',
      new TableColumn({
        name: 'integrated_view',
        type: 'bool',
        isNullable: false,
        default: false,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(TABLE_PREFIX + 'tile_configuration_entity', 'integratedView');
  }
}
