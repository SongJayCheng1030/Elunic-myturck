import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class addShowColumn1633454885814 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      TABLE_PREFIX + 'tile_configuration_entity',
      new TableColumn({
        name: 'show',
        type: 'int',
        default: 1,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(TABLE_PREFIX + 'tile_configuration_entity', 'show');
  }
}
