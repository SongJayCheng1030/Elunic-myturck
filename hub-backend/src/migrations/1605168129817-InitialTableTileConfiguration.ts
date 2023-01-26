import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialTableTileConfiguration1605168129817 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `tile_configuration_entity`,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'tile_name',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'desc',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'app_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'icon_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tile_color',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'tile_text_color',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'order',
            type: 'int',
          },
        ],
        indices: [],
        uniques: [],
        foreignKeys: [],
      }),
    );
  }

  // eslint-disable-next-line unused-imports/no-unused-vars-ts, @typescript-eslint/no-empty-function
  async down(queryRunner: QueryRunner): Promise<void> {}
}
