import { DataResponse, DataResponseMeta, ErrorResponse } from 'shared/common/response';

export function asResponse<T>(obj: T): DataResponse<T>;
export function asResponse<T, U extends DataResponseMeta = Record<string, unknown>>(
  obj: T,
  metaObj: U,
): DataResponse<T, U>;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function asResponse(obj: unknown, metaObj?: unknown) {
  if (metaObj) {
    return {
      data: obj,
      meta: metaObj,
    };
  } else {
    return {
      data: obj,
      meta: {},
    };
  }
}

export function asError<T>(error: T): ErrorResponse<T> {
  return { error, meta: {} };
}
