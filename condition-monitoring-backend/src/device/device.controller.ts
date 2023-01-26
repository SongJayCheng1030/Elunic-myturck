import { Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { asResponse } from 'shared/backend';
import { DataResponse } from 'shared/nestjs';

import { SensorDto } from '../device/device.dto';
import { DeviceEntity } from './device.entity';
import { DeviceService } from './device.service';

@ApiTags('Device')
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get('available')
  async getAvailableDeviceIds(@Req() req: Request): Promise<DataResponse<string[]>> {
    const ids = await this.deviceService.getAvailableIds(req.auth);
    return asResponse(ids);
  }

  @Get('sensors')
  @ApiQuery({ name: 'q', type: String, required: false })
  async getSensorIds(@Req() req: Request, @Query('q') q?: string): Promise<DataResponse<string[]>> {
    const sensors = await this.deviceService.searchSensor(req.auth, q);
    return asResponse(sensors.map(s => s.id));
  }

  @Get('available/:id/sensors')
  async getAvailableSensorIds(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<DataResponse<string[]>> {
    const sensors = await this.deviceService.getAvailableSensors(req.auth, id);
    return asResponse(sensors.map(s => s.id));
  }

  @Post('available/:id/register')
  async registerDevice(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<DataResponse<DeviceEntity>> {
    const device = await this.deviceService.createOne(req.auth, id);
    return asResponse(device);
  }

  @Get('registered')
  async getDevices(@Req() req: Request): Promise<DataResponse<DeviceEntity[]>> {
    const devices = await this.deviceService.getMany(req.auth);
    return asResponse(devices);
  }

  @Get('registered/:id/sensors')
  async getSensors(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<DataResponse<SensorDto[]>> {
    const device = await this.deviceService.getOne(req.auth, id);
    const sensors = await this.deviceService.getAvailableSensors(req.auth, device.id);
    return asResponse(sensors);
  }

  @Get('registered/asset/:assetId')
  async getOneByAssetId(
    @Req() req: Request,
    @Param('assetId') assetId: string,
  ): Promise<DataResponse<DeviceEntity | undefined>> {
    const device = await this.deviceService.getOneByAssetId(req.auth, assetId);
    return asResponse(device);
  }

  @Put('registered/:id/assign/:assetId')
  async assignDevice(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('assetId') assetId: string,
  ): Promise<DataResponse<DeviceEntity>> {
    const assignedDevice = await this.deviceService.assignDevice(req.auth, id, assetId);
    return asResponse(assignedDevice);
  }

  @Put('registered/:id/unassign')
  async unasignDevice(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<DataResponse<DeviceEntity>> {
    const assignedDevice = await this.deviceService.unassignDevice(req.auth, id);
    return asResponse(assignedDevice);
  }
}
