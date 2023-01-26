export type DataResponseMeta = Record<string, unknown>;

export interface DataResponse<T, U extends DataResponseMeta = DataResponseMeta> {
  data: T;
  meta: U;
}

export interface ResponsePagingMeta extends DataResponseMeta {
  count: number;
  total: number;
  page: number;
  pageCount: number;
}

export interface ErrorResponse<T = unknown, U extends DataResponseMeta = DataResponseMeta> {
  error: T;
  meta: U;
}
