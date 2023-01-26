import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { asResponse } from 'shared/backend';
import { CurrentValueAndMachineVariableDto } from 'shared/common/models';
import { DataResponse } from 'shared/nestjs';

import { DataService } from './data.service';

@ApiTags('Data')
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get('current/:assetId/machine-variable/:machineVariableId')
  async currentValueWithMachineVariable(
    @Req() req: Request,
    @Param('assetId') assetId: string,
    @Param('machineVariableId') machineVariableId: string,
  ): Promise<DataResponse<CurrentValueAndMachineVariableDto>> {
    const currentValue = await this.dataService.getCurrentValueWithMachineVariable(
      req.auth,
      assetId,
      machineVariableId,
    );
    return asResponse(currentValue);
  }
}
