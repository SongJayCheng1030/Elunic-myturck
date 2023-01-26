import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialFacadeEntity1615367387592 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_facade_entity`,
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            generationStrategy: 'uuid',
            isPrimary: true,
          },
          {
            name: 'tenant_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'url_path',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'icon_url',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [],
        uniques: [],
        foreignKeys: [],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_facade_entity`);
  }
}
