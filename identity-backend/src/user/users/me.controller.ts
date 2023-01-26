import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { JoiPipe } from 'nestjs-joi';
import { asResponse } from 'shared/backend';
import { AuthInfo } from 'shared/common/types';
import { Auth, DataResponse } from 'shared/nestjs';

import { FreeData, FreeDataUpdateSchema } from '../dto/FreeData';
import { UsersService } from './users.service';

/**
 * This controller contains all actions which are carried out
 * on the current requesting user, for example the `me` route
 * providing user information. This is not supported and expected
 * for users other than the current user (GPDR considerations, ...).
 */
@Controller('users/user/me')
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getCurrentUserInfo(@Auth() authInfo: AuthInfo) {
    return asResponse(await this.usersService.getMeInfo(authInfo));
  }

  @Patch('free-data')
  async setFreeData(
    @Auth() authInfo: AuthInfo,
    // Check that we don't have nested data and ensure that
    // not too much data is added here
    @Body(new JoiPipe(FreeDataUpdateSchema)) dto: FreeData,
  ): Promise<DataResponse<Partial<FreeData>>> {
    await this.usersService.updateFreeDateByUser(authInfo, dto);
    return this.getFreeDateByUser(authInfo);
  }

  @Get('free-data')
  async getFreeDateByUser(
    @Auth() authInfo: AuthInfo,
    @Query('filterKey') filterKey?: string,
  ): Promise<DataResponse<Partial<FreeData>>> {
    return asResponse(await this.usersService.getFreeDateByUser(authInfo, filterKey));
  }
}
