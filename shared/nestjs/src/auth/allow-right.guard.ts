import { CanActivate, ExecutionContext, mixin } from '@nestjs/common';
import { Request } from 'express';

import { DataResponse } from '../models';
import { SharedApiService, SharedService } from '../services';

/**
 * @deprecated
 * @param resourceId
 * @param rightKey
 * @param allowSelf
 * @returns
 */
export const RightGuard = (
  resourceId: any,
  rightKey: any,
  allowSelf?: { idKey: string },
): unknown => {
  class AllowRightMixin implements CanActivate {
    constructor(private sharedApiService: SharedApiService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest<Request>();

      if (allowSelf && req.params[allowSelf.idKey] === req.auth.id) {
        return true;
      }

      const { data } = await this.sharedApiService.httpGetOrFail<DataResponse<boolean>>(
        req.auth,
        SharedService.USER_SERVICE,
        `v1/me/is_allowed/${resourceId}/${rightKey}`,
      );
      return data.data;
    }
  }

  return mixin(AllowRightMixin);
};
