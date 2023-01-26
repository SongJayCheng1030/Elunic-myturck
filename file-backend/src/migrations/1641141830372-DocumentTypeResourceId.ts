import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class DocumentTypeResourceId1641141830372 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      `${TABLE_PREFIX}_document_type_entity`,
      new TableColumn({
        name: 'resource_id',
        type: 'varchar',
        length: '255',
        isNullable: true,
        default: null,
      }),
    );
    await queryRunner.createIndex(
      `${TABLE_PREFIX}_document_type_entity`,
      new TableIndex({
        name: 'UNIQ___document_type_entity___resource_id',
        columnNames: ['tenant_id', 'resource_id'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      `${TABLE_PREFIX}_document_type_entity`,
      'UNIQ___document_type_entity___resource_id',
    );
    await queryRunner.dropColumn(`${TABLE_PREFIX}_document_type_entity`, 'resource_id');
  }
}
