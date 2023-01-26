import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialAssetDocumentEntity1615367387590 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_asset_document_entity`,
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
            name: 'asset_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'document_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'document_type',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '1000',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'KEY___asset_document_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
        ],
        uniques: [],
        foreignKeys: [
          {
            name: 'FK___asset_document_entity___asset_entity___id',
            columnNames: ['asset_id'],
            referencedTableName: `${TABLE_PREFIX}_asset_entity`,
            referencedColumnNames: ['id'],
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_asset_document_entity`);
  }
}
