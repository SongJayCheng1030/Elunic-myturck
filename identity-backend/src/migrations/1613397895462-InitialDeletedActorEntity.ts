import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class InitialDeletedActorEntity1613397895462 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${TABLE_PREFIX}_deleted_actor_entity`,
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
            name: 'ref_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'char',
            length: '14',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'char',
            length: '36',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'IDX_delactent_tenantId',
            columnNames: ['tenant_id'],
          },
          {
            name: 'IDX_delactent_refId',
            columnNames: ['ref_id'],
          },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${TABLE_PREFIX}_deleted_actor_entity`);
  }
}
