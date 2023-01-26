import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ConnectionOptions } from 'typeorm';
import { MIGRATION_PATH, MIGRATION_TABLE_NAME } from './src/definitions';

const config: ConnectionOptions = {
  type: 'mysql',
  host: process.env.APP_DB_HOST_CORE || process.env.APP_DB_HOST || '',
  port: Number(process.env.APP_DB_PORT) || 3306,
  username: process.env.APP_DB_USER || '',
  password: process.env.APP_DB_PASS || '',
  database: process.env.APP_DB_NAME_CORE || process.env.APP_DB_NAME || '',
  ssl: process.env.NODE_ENV !== 'development',
  extra: { insecureAuth: true },
  synchronize: false,
  migrations: [MIGRATION_PATH],
  migrationsTableName: MIGRATION_TABLE_NAME,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [__dirname + '/src/**/*.entity.{ts,js}'],
  maxQueryExecutionTime: 5000,
};

export = config;
