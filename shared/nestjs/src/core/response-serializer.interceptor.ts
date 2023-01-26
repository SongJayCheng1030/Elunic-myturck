import {
  CallHandler,
  ClassSerializerInterceptor,
  ExecutionContext,
  Injectable,
  PlainLiteralObject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { asResponse, DataResponse } from '../models';

type Response =
  | PlainLiteralObject
  | PlainLiteralObject[]
  | DataResponse<PlainLiteralObject>
  | DataResponse<PlainLiteralObject[]>;

@Injectable()
export class ResponseSerializerInterceptor extends ClassSerializerInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextOptions = this.getContextOptions(context);
    const options = {
      ...this.defaultOptions,
      ...contextOptions,
    };
    return next.handle().pipe(
      map((res: Response) => {
        const mappedData = this.serialize('data' in res && 'meta' in res ? res.data : res, options);
        return asResponse(mappedData);
      }),
    );
  }
}
