import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialTableGeneralSettings1605104404814 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `general_settings_entity`,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'primary_color',
            type: 'varchar',
            length: '36',
            isNullable: false,
            default: "'#000000'",
          },
          {
            name: 'bg_color',
            type: 'varchar',
            length: '36',
            isNullable: false,
            default: "'#ffffff'",
          },
          {
            name: 'light',
            type: 'bool',
            isNullable: true,
          },
          {
            name: 'bg_image',
            type: 'text',
            isNullable: true,
          },
        ],
        indices: [],
        uniques: [],
        foreignKeys: [],
      }),
    );

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('general_settings_entity')
      .values({
        primary_color: '#258FD4',
        bg_color: '#ffffff',
        light: true,
        bg_image: '',
        id: 1,
      })
      .execute();
  }

  // eslint-disable-next-line unused-imports/no-unused-vars-ts, @typescript-eslint/no-empty-function
  async down(queryRunner: QueryRunner): Promise<void> {}
}
