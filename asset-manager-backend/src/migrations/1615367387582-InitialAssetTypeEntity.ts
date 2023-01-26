import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialAssetTypeEntity1615367387582 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_asset_type_entity`,
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
            name: 'is_built_in',
            type: 'tinyint',
            default: 0,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'extends_type_id',
            type: 'char',
            length: '36',
            isNullable: true,
          },
          {
            name: 'equipment_type',
            type: 'enum',
            enum: [
              'NONE',
              'ENTERPRISE',
              'SITE',
              'AREA',
              'WORK_CENTER',
              'PROCESS_CELL',
              'PRODUCTION_UNIT',
              'PRODUCTION_LINE',
              'STORAGE_ZONE',
              'WORK_UNITS',
              'STORAGE_UNIT',
              'EQUIPMENT_MODULE',
              'CONTROL_MODULE',
              'UNIT',
            ],
            default: `'NONE'`,
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
          {
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'KEY___asset_type_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
        uniques: [],
        foreignKeys: [
          {
            name: 'FK___asset_type_entity___asset_type_entity___id',
            columnNames: ['extends_type_id'],
            referencedTableName: `${TABLE_PREFIX}_asset_type_entity`,
            referencedColumnNames: ['id'],
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_asset_type_entity`);
  }
}
