export function getTypeOrmQueryDebuggingSetting(): {
  logging?:
    | boolean
    | 'all'
    | Array<'query' | 'schema' | 'error' | 'warn' | 'info' | 'log' | 'migration'>;
  debug?: boolean | string[];
} {
  return {
    logging: `${process.env.LOG_TYPEORM_QUERIES || ''}`.length > 0 ? ['query', 'error'] : [],
    debug: `${process.env.LOG_TYPEORM_ALL || ''}`.length > 0,
  };
}
