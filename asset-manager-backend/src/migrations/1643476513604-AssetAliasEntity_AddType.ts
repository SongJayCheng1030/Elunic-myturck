import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class AssetAliasEntity_AddType1643476513604 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      `${TABLE_PREFIX}_asset_alias_entity`,
      new TableColumn({
        name: 'type',
        type: 'enum',
        enum: ['GENERAL', 'QR_CODE'],
        default: `'GENERAL'`,
        isNullable: false,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(`${TABLE_PREFIX}_asset_alias_entity`, 'type');
  }
}
