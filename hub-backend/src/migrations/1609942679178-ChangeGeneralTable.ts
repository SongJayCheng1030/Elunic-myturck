import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class ChangeGeneralTable1609942679178 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(TABLE_PREFIX + 'general_settings_entity', 'primary_color');

    await queryRunner.dropColumn(TABLE_PREFIX + 'general_settings_entity', 'bg_color');

    await queryRunner.dropColumn(TABLE_PREFIX + 'general_settings_entity', 'light');

    await queryRunner.dropColumn(TABLE_PREFIX + 'general_settings_entity', 'bg_image');

    await queryRunner.addColumn(
      TABLE_PREFIX + 'general_settings_entity',
      new TableColumn({
        name: 'key',
        type: 'varchar',
        length: '100',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      TABLE_PREFIX + 'general_settings_entity',
      new TableColumn({
        name: 'value',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    await queryRunner.manager.delete(TABLE_PREFIX + 'general_settings_entity', {
      id: 1,
    });
  }

  // eslint-disable-next-line unused-imports/no-unused-vars-ts, @typescript-eslint/no-empty-function
  async down(queryRunner: QueryRunner): Promise<void> {}
}
