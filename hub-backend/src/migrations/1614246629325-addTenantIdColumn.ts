import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class addTenantIdColumn1614246629325 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      TABLE_PREFIX + 'general_settings_entity',
      new TableColumn({
        name: 'tenant_id',
        type: 'char',
        length: '36',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      TABLE_PREFIX + 'tile_configuration_entity',
      new TableColumn({
        name: 'tenant_id',
        type: 'char',
        length: '36',
        isNullable: true,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(TABLE_PREFIX + 'general_settings_entity', 'tenant_id');
    await queryRunner.dropColumn(TABLE_PREFIX + 'tile_configuration_entity', 'tenant_id');
  }
}
