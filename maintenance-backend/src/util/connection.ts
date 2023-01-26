import { ConnectionOptions, createConnection, getConnection, QueryRunner } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export function getTestConnectionOpts(): ConnectionOptions {
  return {
    type: 'mysql',
    host: process.env.APP_TEST_DB_HOST_BACKEND || process.env.APP_TEST_DB_HOST,
    port: Number(process.env.APP_TEST_DB_PORT) || 3306,
    username: process.env.APP_TEST_DB_USER,
    password: process.env.APP_TEST_DB_PASS,
    ssl: false,
    namingStrategy: new SnakeNamingStrategy(),
  };
}

async function startConnection(opts: ConnectionOptions): Promise<QueryRunner> {
  const conn = await createConnection(opts);
  return conn.createQueryRunner();
}

async function endConnection(queryRunner: QueryRunner): Promise<void> {
  const conn = queryRunner.connection;
  await queryRunner.release();
  await conn.close();
}

export async function createTestDatabase(opts: ConnectionOptions): Promise<string> {
  const testDbName = process.env.APP_TEST_DB_NAME || `test_db_${Math.round(Math.random() * 1e9)}`;
  const queryRunner = await startConnection(opts);
  await queryRunner.createDatabase(testDbName, true);
  await endConnection(queryRunner);

  return testDbName;
}

export async function dropTestDatabase(dbName: string, opts: ConnectionOptions): Promise<void> {
  let queryRunner: QueryRunner;
  try {
    queryRunner = await startConnection(opts);
  } catch (e) {
    if ((e as Error).name === 'AlreadyHasActiveConnectionError') {
      const conn = getConnection();
      queryRunner = conn.createQueryRunner();
    } else {
      throw e;
    }
  }

  await queryRunner.dropDatabase(dbName);

  await endConnection(queryRunner);
}
