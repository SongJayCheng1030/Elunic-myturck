import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class ModifyAssetEntityAddImageMap1648725329122 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      `${TABLE_PREFIX}_asset_entity`,
      new TableColumn({
        name: 'image_map_id',
        type: 'char',
        length: '36',
        isNullable: true,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(`${TABLE_PREFIX}_asset_entity`, 'image_map_id');
  }
}
