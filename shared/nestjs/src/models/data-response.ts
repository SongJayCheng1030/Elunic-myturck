import { ApiProperty } from '@nestjs/swagger';
import { GetManyDefaultResponse } from '@rewiko/crud';
import { asResponse } from 'shared/backend/response';
import { DataResponse, DataResponseMeta, ResponsePagingMeta } from 'shared/common/response';
import { Constructor } from 'shared/common/types';

// Legacy compatibility, do not use. Use the exports from the common library.
export { asResponse, DataResponse, DataResponseMeta, ResponsePagingMeta };

export class ApiResponse<T, U extends DataResponseMeta = DataResponseMeta>
  implements DataResponse<T, U>
{
  @ApiProperty({ type: Object })
  data!: T;

  @ApiProperty({ type: Object })
  meta!: U;
}

export class ApiPaginationMeta implements ResponsePagingMeta {
  [key: string]: unknown;

  @ApiProperty({ type: Number })
  count!: number;

  @ApiProperty({ type: Number })
  total!: number;

  @ApiProperty({ type: Number })
  page!: number;

  @ApiProperty({ type: Number })
  pageCount!: number;
}

export class ApiManyPaginationData<T> implements DataResponse<T[], ApiPaginationMeta> {
  @ApiProperty({ type: Object, isArray: true })
  data!: T[];

  @ApiProperty({ type: ApiPaginationMeta })
  meta!: ApiPaginationMeta;
}

export class ApiManyData<T> implements DataResponse<T[], any> {
  @ApiProperty({ type: Object, isArray: true })
  data!: T[];

  @ApiProperty({ type: Object })
  meta!: object;
}

export function getResponseFor<T extends Constructor>(type: T): typeof ApiResponse {
  class ApiResponseForEntity extends ApiResponse<T> {
    @ApiProperty({ type })
    data!: T;
  }
  Object.defineProperty(ApiResponseForEntity, 'name', {
    value: `ApiResponseForEntity${type.name}`,
  });

  return ApiResponseForEntity as typeof ApiResponse;
}

export function getResponseForManyPagination<T extends Constructor>(type: T): typeof ApiResponse {
  class ApiResponseForEntityArray extends ApiManyPaginationData<T> {
    @ApiProperty({
      type,
      isArray: true,
    })
    data!: T[];
  }
  Object.defineProperty(ApiResponseForEntityArray, 'name', {
    value: `ApiResponseForEntityManyPagination${type.name}`,
  });

  return ApiResponseForEntityArray as typeof ApiResponse;
}

export function getResponseForMany<T extends Constructor>(type: T): typeof ApiResponse {
  class ApiResponseForEntityArray extends ApiManyData<T> {
    @ApiProperty({
      type,
      isArray: true,
    })
    data!: T[];
  }
  Object.defineProperty(ApiResponseForEntityArray, 'name', {
    value: `ApiResponseForEntityMany${type.name}`,
  });

  return ApiResponseForEntityArray as typeof ApiResponse;
}

/**
 * Transforms the result from a nestjsx/crud for a call to `getManyBase`
 * into the common `DataResponse` format where the pagination data is
 * moved into the `meta` key. Optionally a second argument can be added
 * to transform the objects using a function e.g. to an external format
 * etc.
 *
 * @param input The input data, directly from `getManyBase`
 * @param transformer A possible callback or by default the identity
 * function
 */
export function getDataResponseForCrudMany<T, K>(
  input: GetManyDefaultResponse<T> | T[],
  transformer?: (arg: T) => K,
): DataResponse<K[], ApiPaginationMeta> {
  if (Array.isArray(input)) {
    if (transformer) {
      return asResponse(input.map(transformer)) as unknown as DataResponse<K[], ApiPaginationMeta>;
    } else {
      return asResponse(input) as unknown as DataResponse<K[], ApiPaginationMeta>;
    }
  }

  if (typeof input['data'] !== 'undefined') {
    return asResponse(
      transformer ? input['data'].map(transformer) : (input['data'] as unknown as K[]),
      {
        count: input.count,
        pageCount: input.pageCount,
        page: input.page,
        total: input.total,
      },
    );
  }

  throw new Error(`Cannot identify input for getDataResponseForCrudMany()`);
}
