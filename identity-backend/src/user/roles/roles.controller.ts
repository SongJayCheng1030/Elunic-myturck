import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { JoiPipe } from 'nestjs-joi';
import { AuthInfo } from 'shared/common/types';
import { asResponse, Auth } from 'shared/nestjs';

import {
  CreateRoleDto,
  CreateRoleDtoSchema,
  UpdateRoleDto,
  UpdateRoleDtoSchema,
} from '../dto/Role';
import { RolesService } from './roles.service';

@Controller('users/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async listRoles(@Auth() authInfo: AuthInfo) {
    const roles = await this.rolesService.findAll(authInfo);
    return asResponse(roles);
  }

  @Get('rights')
  async listAllRights() {
    return asResponse(await this.rolesService.findAllRights());
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Auth() authInfo: AuthInfo) {
    const role = await this.rolesService.findById(authInfo, id);
    return asResponse(role);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteById(@Param('id') id: string, @Auth() authInfo: AuthInfo) {
    await this.rolesService.deleteById(authInfo, id);
  }

  @Put(':id')
  async updateRole(
    @Auth() authInfo: AuthInfo,
    @Param('id') id: string,
    @Body(new JoiPipe(UpdateRoleDtoSchema)) dto: UpdateRoleDto,
  ) {
    const role = await this.rolesService.updateForTenant(authInfo, id, dto);
    return asResponse(role);
  }

  @Post()
  @HttpCode(201)
  async createRole(
    @Auth() authInfo: AuthInfo,
    @Body(new JoiPipe(CreateRoleDtoSchema)) dto: CreateRoleDto,
  ) {
    const role = await this.rolesService.createForTenant(authInfo, dto);
    return asResponse(role);
  }
}
