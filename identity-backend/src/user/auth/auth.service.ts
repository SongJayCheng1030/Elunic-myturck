import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthInfo } from 'shared/common/types';

import { TenantService } from '../../tenant/tenant.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly usersService: UsersService,
    @InjectLogger('AuthService')
    private readonly logger: Logger,
  ) {}

  /**
   * Switches the tenant of the current, requesting user and returns
   * a redirect URL to "log-in" into the new tenant
   *
   * @param authInfo The user to switch the tenant for
   * @param targetTenantId The new tenant id
   */
  async switchTenant(authInfo: AuthInfo, targetTenantId: string): Promise<void> {
    // Ensure that we are allowed to change the tenant
    const validRequest = await this.tenantService.isUserInTenant(authInfo, targetTenantId);
    if (!validRequest) {
      throw new BadRequestException(`User cannot change to a foreign tenant`);
    }

    try {
      const user = await this.usersService.updatePartial(authInfo.id, {
        tenantId: targetTenantId,
      });

      if (!user || user.tenantId !== targetTenantId) {
        throw new Error(`Assert failed: tenant not switched.`);
      }

      return; // Everything is fine
    } catch (ex) {
      this.logger.error(
        `Cannot switchTenant (targetTenantId=${targetTenantId}, user=${authInfo.id}): ${ex}`,
      );
      throw new InternalServerErrorException(`Failed to perform tenant switch (see logs)`);
    }
  }
}
