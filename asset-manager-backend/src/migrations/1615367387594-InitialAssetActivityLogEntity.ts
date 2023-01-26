import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialAssetActivityLogEntity1615367387594 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_activity_log_entity`,
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
            name: 'object_type',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'ref_id',
            type: 'char',
            length: '36',
            isNullable: true,
          },
          {
            name: 'activity_type',
            type: 'enum',
            enum: [
              'GENERAL_CHANGE',
              'CREATED',
              'FIELD_UPDATED',
              'PROPERTY_UPDATED',
              'ASSET_TYPE_UPDATED',
              'SOFT_DELETED',
              'COLLECTION_UPDATED',
            ],
            default: `'GENERAL_CHANGE'`,
            isNullable: false,
          },
          {
            name: 'field_key',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'old_value',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'new_value',
            type: 'json',
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
            name: 'KEY___activity_entity___tenant_id',
            columnNames: ['tenant_id'],
          },
          {
            name: 'KEY___activity_entity___filter_date',
            columnNames: ['created_at'],
          },
          {
            name: 'KEY___activity_entity___filter_object_type',
            columnNames: ['object_type'],
          },
          {
            name: 'KEY___activity_entity___filter_ref_id',
            columnNames: ['ref_id'],
          },
        ],
        uniques: [],
        foreignKeys: [],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_activity_log_entity`);
  }
}
