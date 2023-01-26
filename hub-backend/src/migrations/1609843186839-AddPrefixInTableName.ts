import { MigrationInterface, QueryRunner } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class AddPrefixInTableName1609843186839 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable(
      'general_settings_entity',
      TABLE_PREFIX + 'general_settings_entity',
    );
    await queryRunner.renameTable(
      'tile_configuration_entity',
      TABLE_PREFIX + 'tile_configuration_entity',
    );
  }

  // eslint-disable-next-line unused-imports/no-unused-vars-ts, @typescript-eslint/no-empty-function
  async down(queryRunner: QueryRunner): Promise<void> {}
}
