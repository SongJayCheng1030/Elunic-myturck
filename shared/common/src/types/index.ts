export * from './auth';

export type UUIDv4 = string;
export type TenantId = string;
export type ISODateString = string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Constructor<T = any> extends Function {
  new (...args: unknown[]): T;
}

export interface OrderBy {
  key: string;
  direction: 'ASC' | 'DESC';
}
