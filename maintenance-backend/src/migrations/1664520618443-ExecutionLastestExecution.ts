import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_PREFIX } from '../definitions';

export class ExecutionLastestExecution1664520618443 implements MigrationInterface {
  name = 'ExecutionLastestExecution1664520618443';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(`${TABLE_PREFIX}_execution_entity`, [
      new TableColumn({
        name: 'latest_execution',
        type: 'boolean',
        isNullable: true,
      }),
    ]);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(`${TABLE_PREFIX}_execution_entity`, ['latest_execution']);
  }
}
