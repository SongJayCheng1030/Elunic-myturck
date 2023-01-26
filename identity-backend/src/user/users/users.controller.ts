import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { JoiPipe } from 'nestjs-joi';
import { asResponse } from 'shared/backend';
import { AuthInfo } from 'shared/common/types';
import { Auth, DataResponse } from 'shared/nestjs';

import { CreateUserSchema, UpdateUser, UpdateUserSchema } from '../dto/UpdateUser';
import { User } from '../dto/User';
import { UsersService } from './users.service';

@Controller('users/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsersForTenant(@Auth() authInfo: AuthInfo): Promise<DataResponse<User[]>> {
    return asResponse(await this.usersService.getAllByTenant(authInfo));
  }

  @Get(':id')
  async getUserDetails(
    @Auth() authInfo: AuthInfo,
    @Param('id') userId: string,
  ): Promise<DataResponse<User>> {
    return asResponse(await this.usersService.getByIdByTenant(authInfo, userId));
  }

  @Post()
  async createUser(
    @Auth() authInfo: AuthInfo,
    @Body(new JoiPipe(CreateUserSchema)) dto: UpdateUser,
  ): Promise<DataResponse<User>> {
    return asResponse(await this.usersService.createForTenant(authInfo, dto));
  }

  @Put(':id')
  async updateUser(
    @Auth() authInfo: AuthInfo,
    @Param('id') userId: string,
    @Body(new JoiPipe(UpdateUserSchema)) dto: UpdateUser,
  ): Promise<DataResponse<User>> {
    return asResponse(await this.usersService.updateByIdForTenant(authInfo, userId, dto));
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Auth() authInfo: AuthInfo, @Param('id') userId: string) {
    await this.usersService.deleteByIdForTenant(authInfo, userId);
  }
}
