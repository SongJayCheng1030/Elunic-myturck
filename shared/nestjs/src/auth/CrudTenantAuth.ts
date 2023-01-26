import { CrudAuth } from '@rewiko/crud';
import { AuthInfo } from 'shared/common/types';

export function TenantIdAutoFilter(
  reqAuthKey = 'tenantId',
  queryKey = 'tenantId',
): (target: typeof Object.prototype) => void {
  return CrudAuth({
    property: 'auth',
    filter: (auth: AuthInfo) => {
      return {
        // @ts-ignore
        [queryKey]: auth[reqAuthKey],
      };
    },
    persist: (auth: AuthInfo) => {
      return {
        // @ts-ignore
        [queryKey]: auth[reqAuthKey],
      };
    },
  });
}
