import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { keyBy } from 'lodash';
import { asResponse } from 'shared/backend';
import { AuthInfo } from 'shared/common/types';
import { Auth, DataResponse } from 'shared/nestjs';

import { ActorNameResult } from '../dto/ActorNameResult';
import { UsersService } from './users.service';

@Controller('users/names')
export class UserNamesController {
  constructor(private readonly usersService: UsersService) {}

  // Everyone who is signed-in is allowed to use this endpoint
  @Get()
  async getUserByIdBatch(
    @Auth() authInfo: AuthInfo,
    @Query('ids') userIds?: string | string[],
    @Query('map') toMap?: string,
  ): Promise<DataResponse<{ [key: string]: ActorNameResult } | ActorNameResult[]>> {
    const ids = this.userIdsMixedToArrayOrFail(userIds);
    const resolved = await this.usersService.resolveNamesByUserIds(authInfo, ids);

    // It is requested to return the result as a map rather than an array
    if (['1', 'on', 'yes', 'y', 'true'].includes(toMap || 'false')) {
      return asResponse(keyBy(resolved, 'id'));
    }

    // Default is array
    return asResponse(resolved);
  }

  @Get('available')
  // Everyone who is signed-in is allowed to use this endpoint
  async isNameAvailable(
    @Query('q') userName: string,
    @Auth() authInfo: AuthInfo,
  ): Promise<DataResponse<any>> {
    const name = `${userName || ''}`.trim();

    // Ensure a name
    if (!name || name.length < 2) {
      return asResponse({
        available: false,
        errors: [`Name too short or empty`],
      });
    }

    const ok = await this.usersService.userNameAvailable(authInfo, name);
    if (!ok) {
      return asResponse({
        available: false,
        errors: [`Username already in use or does not meet name policy`],
      });
    }

    return asResponse({
      available: true,
      errors: [],
    });
  }

  // ---

  private userIdsMixedToArrayOrFail(userIds: null | undefined | string | string[]): string[] {
    // Parse the supplied ids into an array
    let userIdsArr: string[] = [];

    if (typeof userIds === 'string') {
      userIdsArr = `${userIds}`.split(',');
    } else if (userIds && Array.isArray(userIds)) {
      userIdsArr = (userIds as string[]).map(id => `${id}`);
    } else {
      throw new BadRequestException(`Illegal parameter for ids argument`);
    }

    return userIdsArr.filter(id => id.length === 36);
  }
}
