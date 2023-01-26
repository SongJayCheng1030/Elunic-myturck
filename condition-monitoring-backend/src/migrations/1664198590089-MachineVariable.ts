import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class MachineVariable1664198590089 implements MigrationInterface {
  name = 'MachineVariable1664198590089';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(`${TABLE_PREFIX}_gf_tile_entity`, 'parameter');
    await queryRunner.addColumn(
      `${TABLE_PREFIX}_gf_tile_entity`,
      new TableColumn({
        name: 'machine_variable_id',
        type: 'char',
        length: '36',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      `${TABLE_PREFIX}_gf_tile_entity`,
      new TableForeignKey({
        name: 'FK___gf_tile_entity___machine___variable',
        columnNames: ['machine_variable_id'],
        referencedTableName: `${TABLE_PREFIX}_machine_variable_entity`,
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      `${TABLE_PREFIX}_gf_tile_entity`,
      'FK___gf_tile_entity___machine___variable',
    );
    await queryRunner.dropColumn(`${TABLE_PREFIX}_gf_tile_entity`, 'machine_variable_id');
    await queryRunner.addColumn(
      `${TABLE_PREFIX}_gf_tile_entity`,
      new TableColumn({
        name: 'parameter',
        type: 'varchar',
        length: '200',
        isNullable: false,
      }),
    );
  }
}
