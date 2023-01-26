import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JoiPipe } from 'nestjs-joi';
import { asResponse, DataResponse } from 'shared/nestjs';

import { CreateTenantClassDto, CreateUpdateTenantDtoSchema } from './dto/CreateTenantDto';
import { TenantDto } from './dto/TenantDto';
import { UpdateTenantClassDto, UpdateTenantDtoSchema } from './dto/UpdateTenantDto';
import { TenantEntity } from './tenant.entity';
import { TenantService } from './tenant.service';

@ApiTags('Tenant Controller')
@Controller('tenants')
export class TenantController {
  constructor(public service: TenantService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of tenants' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({
    status: 200,
    description: 'The List is provided',
    type: TenantDto,
    isArray: true,
  })
  async getMany(@Req() req: Request): Promise<DataResponse<TenantDto[]>> {
    const tenants = await this.service.findAll(req.auth);
    return asResponse(tenants.map(TenantEntity.toExternal));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({
    status: 200,
    description: 'The Tenant is provided',
    type: TenantDto,
  })
  @ApiParam({ name: 'id', type: String })
  async getOne(@Req() req: Request, @Param('id') id: string): Promise<DataResponse<TenantDto>> {
    const tenant = await this.service.getById(req.auth, id);
    return asResponse(TenantEntity.toExternal(tenant));
  }

  @Post()
  @ApiOperation({ summary: 'Create Tenant' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({
    status: 201,
    description: 'The Tenant is created',
    type: TenantDto,
  })
  async createTenant(
    @Req() req: Request,
    @Body(new JoiPipe(CreateUpdateTenantDtoSchema)) dto: CreateTenantClassDto,
  ): Promise<DataResponse<TenantDto>> {
    const tenant = await this.service.create(req.auth, dto);
    return asResponse(TenantEntity.toExternal(tenant));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 400, description: 'Invalid params' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({
    status: 200,
    description: 'The Tenant is updated',
    type: TenantDto,
  })
  @ApiParam({ name: 'id', type: String })
  async updateTenant(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(new JoiPipe(UpdateTenantDtoSchema)) dto: UpdateTenantClassDto,
  ): Promise<DataResponse<TenantDto>> {
    const tenant = await this.service.update(req.auth, id, dto);
    return asResponse(TenantEntity.toExternal(tenant));
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete tenant by id' })
  @ApiResponse({ status: 401, description: 'Forbidden to access: Not authorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({
    status: 200,
    description: 'The Tenant is deleted',
    type: Boolean,
  })
  @ApiParam({ name: 'id', type: String })
  async deleteTenant(@Req() req: Request, @Param('id') id: string): Promise<void> {
    await this.service.remove(req.auth, id);
  }
}
