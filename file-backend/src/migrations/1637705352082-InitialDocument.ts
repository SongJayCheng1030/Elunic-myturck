import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialDocument1613397895460 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_document_type_entity`,
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            generationStrategy: 'uuid',
            isPrimary: true,
          },
          {
            name: 'tenant_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'created_by',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP()',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP()',
            onUpdate: 'CURRENT_TIMESTAMP()',
          },
        ],
        indices: [
          {
            name: 'KEY___document_type_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
        uniques: [],
        foreignKeys: [],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_document_entity`,
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            generationStrategy: 'uuid',
            isPrimary: true,
          },
          {
            name: 'tenant_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'created_by',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'file_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP()',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP()',
            onUpdate: 'CURRENT_TIMESTAMP()',
          },
          {
            name: 'type_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'KEY___document_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
        uniques: [],
        foreignKeys: [
          {
            name: 'FK___document_entity___document_type_entity___id',
            columnNames: ['type_id'],
            referencedTableName: `${TABLE_PREFIX}_document_type_entity`,
            referencedColumnNames: ['id'],
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_document_link_entity`,
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            generationStrategy: 'uuid',
            isPrimary: true,
          },
          {
            name: 'tenant_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'created_by',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP()',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP()',
            onUpdate: 'CURRENT_TIMESTAMP()',
          },
          {
            name: 'ref_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'ref_type',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'document_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'KEY___document_link_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
        uniques: [
          {
            name: 'UNIQ___document_link_entity___ref_id',
            columnNames: ['document_id', 'ref_id'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK___document_link_entity___document_entity___id',
            columnNames: ['document_id'],
            referencedTableName: `${TABLE_PREFIX}_document_entity`,
            referencedColumnNames: ['id'],
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_document_link_entity`);
    await queryRunner.dropTable(`${TABLE_PREFIX}_document_entity`);
    await queryRunner.dropTable(`${TABLE_PREFIX}_document_type_entity`);
  }
}
