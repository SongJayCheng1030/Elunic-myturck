import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class DocumentActivityLog1641402202123 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_activity_log_entity`,
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
            name: 'ref_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'created',
              'updated',
              'type_changed',
              'file_replaced',
              'ref_assigned',
              'ref_unassigned',
              'deleted',
            ],
            isNullable: false,
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_activity_log_entity`);
  }
}
