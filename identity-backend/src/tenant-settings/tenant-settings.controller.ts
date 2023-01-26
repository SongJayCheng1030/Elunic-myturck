import { Body, Controller, ForbiddenException, Get, Param, Put, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { AuthInfo } from 'shared/common/types';
import { asResponse, DataResponse } from 'shared/nestjs';

import { GroupDto } from './dto/GroupDto';
import { TenantSettingsDto } from './dto/TenantSettingsDto';
import {
  UpdateTenantSettingsClassDto,
  UpdateTenantSettingsDtoSchema,
} from './dto/UpdateTenantSettingsDto';
import { TenantSettingsEntity } from './tenant-settings.entity';
import { TenantSettingsService } from './tenant-settings.service';

@ApiTags('Tenant Settings Controller')
@Controller('tenant-settings')
export class TenantSettingsController {
  constructor(public service: TenantSettingsService) {}

  @Get('device-group-id/options')
  @ApiOperation({ summary: 'Fetch available cumulocity groups' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Available cumulocity group ids',
    type: GroupDto,
    isArray: true,
  })
  async getAvailableC8yGroups(@Req() { auth }: Request): Promise<DataResponse<GroupDto[]>> {
    this.assertMultiTenantAuth(auth);

    const groups = await this.service.getAvailableC8yGroups();
    return asResponse(groups);
  }

  @Get(':tenantId/c8y-group')
  @ApiOperation({ summary: 'Fetch connected cumulocity group' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Connected',
    type: GroupDto,
  })
  async getC8yGroup(
    @Req() { auth }: Request,
    @Param('tenantId') tenantId: string,
  ): Promise<DataResponse<GroupDto>> {
    this.assertMultiTenantAuth(auth);

    const group = await this.service.getC8yGroup(tenantId);
    return asResponse(group);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of tenant settings based on tenantId from AuthInfo' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({
    status: 200,
    description: 'The List is provided',
    type: TenantSettingsDto,
    isArray: true,
  })
  async getAll(@Req() req: Request): Promise<DataResponse<TenantSettingsDto[]>> {
    const tenants = await this.service.findAll(req.auth);
    return asResponse(tenants.map(TenantSettingsEntity.toExternal));
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get tenant setting by key' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Tenant setting is provided',
    type: TenantSettingsDto,
  })
  @ApiParam({ name: 'key', type: String })
  async getByKey(
    @Param('key') key: string,
    @Req() req: Request,
  ): Promise<DataResponse<TenantSettingsDto>> {
    const tenantSettings = await this.service.getOneByKey(req.auth.tenantId, key);
    return asResponse(TenantSettingsEntity.toExternal(tenantSettings));
  }

  @Put(':tenantId/:key')
  @ApiOperation({ summary: 'Update tenant setting by tenant id and key' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({
    status: 200,
    description: 'Tenant setting is updated',
    type: TenantSettingsDto,
  })
  @ApiParam({ name: 'tenantId', type: String })
  @ApiParam({ name: 'key', type: String })
  async updateOne(
    @Body(new JoiPipe(UpdateTenantSettingsDtoSchema)) dto: UpdateTenantSettingsClassDto,
    @Param('tenantId') tenantId: string,
    @Param('key') key: string,
    @Req() { auth }: Request,
  ): Promise<DataResponse<TenantSettingsDto>> {
    this.assertMultiTenantAuth(auth);

    const tenantSettings = await this.service.updateOne(auth, tenantId, key, dto);
    return asResponse(TenantSettingsEntity.toExternal(tenantSettings));
  }

  private assertMultiTenantAuth(authInfo: AuthInfo): void {
    if (!authInfo.isMultiTenantAdmin) {
      throw new ForbiddenException('Only multitenant users are allowed to update this setting');
    }
  }
}
