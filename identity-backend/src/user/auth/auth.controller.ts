import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { ConfigService } from '../../config/config.service';
import { AuthService } from './auth.service';
import Joi = require('joi');
import { asResponse } from 'shared/backend';
import { URL } from 'url';

@Controller('/users/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
    @InjectLogger('AuthController')
    private readonly logger: Logger,
  ) {}

  @Get('sign_out')
  async signOut(@Res() res: Response) {
    const redirectUrl = this.getOAuth2LogoutRedirectUrl();
    this.logger.debug(`signOut(): redirectUrl=${redirectUrl}`);
    res.redirect(302, redirectUrl);
  }

  @Post('tenant/:tenantId')
  async switchTenant(@Param('tenantId') tenantId: string, @Req() req: Request) {
    // Perform the tenant switch
    Joi.assert(tenantId, Joi.string().uuid());
    await this.authService.switchTenant(req.auth, tenantId);

    // No exception, everything fine
    return asResponse({
      redirectUrl: new URL('/oauth2/start', this.config.getSystemOriginUrl()).href,
      tenantId,
    });
  }

  // ---

  private getOAuth2LogoutRedirectUrl(): string {
    const oauth2LogoutUrl = encodeURIComponent(
      new URL('/oauth2/sign_out', this.config.getSystemOriginUrl()).href,
    );
    const rd = new URL(
      `/auth/realms/${this.config.keycloak.realmName}/protocol/openid-connect/logout?redirect_uri=${oauth2LogoutUrl}`,
      this.config.getSystemOriginUrl(),
    );
    return rd.href;
  }
}
