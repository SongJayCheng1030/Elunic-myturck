import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class DeviceAssetId1663052470817 implements MigrationInterface {
  name = 'DeviceAssetId1663052470817';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      `${TABLE_PREFIX}_device_entity`,
      new TableColumn({
        name: 'asset_id',
        type: 'char',
        length: '36',
        default: null,
        isNullable: true,
      }),
    );
    await queryRunner.createIndex(
      `${TABLE_PREFIX}_device_entity`,
      new TableIndex({
        name: 'KEY___device_entity___asset_id',
        columnNames: ['asset_id'],
        isUnique: true,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(`${TABLE_PREFIX}_device_entity`, 'KEY___device_entity___asset_id');
    await queryRunner.dropColumn(`${TABLE_PREFIX}_device_entity`, 'asset_id');
  }
}
