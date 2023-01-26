import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { CurrentValueAndMachineVariableDto } from 'shared/common/models';
import { AuthInfo } from 'shared/common/types';
import { Connection } from 'typeorm';

import { DeviceService } from '../device/device.service';
import { MachineVariableService } from '../machine-variable/machine-variable.service';
import { SeriesEntity } from './entity/series.entity';

@Injectable()
export class DataService {
  constructor(
    @InjectConnection('data_lake') private readonly connection: Connection,
    private readonly deviceService: DeviceService,
    private readonly machineVariableService: MachineVariableService,
    @InjectLogger(DataService.name)
    private readonly logger: Logger,
  ) {}

  async getCurrentValueWithMachineVariable(
    authInfo: AuthInfo,
    assetId: string,
    machineVariableId: string,
  ): Promise<CurrentValueAndMachineVariableDto> {
    const [device, machineVariable] = await Promise.all([
      this.deviceService.getOneByAssetId(authInfo, assetId),
      this.machineVariableService.findOne({
        where: {
          id: machineVariableId,
          tenantId: authInfo.tenantId,
        },
      }),
    ]);
    if (!device) {
      this.logger.error(`No device for asset with ID ${assetId}`);
      throw new NotFoundException(`Could not find a device for asset with ID ${assetId}`);
    }
    if (!machineVariable) {
      this.logger.error(`No machine variable with ID ${machineVariable}`);
      throw new NotFoundException(`Could not find a machine variable with ID ${machineVariable}`);
    }
    const series = await this.connection.getRepository(SeriesEntity).findOne({
      select: ['time', 'value'],
      where: {
        deviceId: device.id,
        parameterId: machineVariable.parameterId,
        aggregate: 'last',
      },
      order: {
        time: 'DESC',
      },
    });

    if (!series) {
      this.logger.error(
        `No series data asset ID: ${assetId}, device ID: ${device.id}, parameter: ${machineVariable.parameterId}`,
      );
      throw new NotFoundException(
        `Could not find any data for asset: ${assetId} and machine variable: ${machineVariable}`,
      );
    }
    return { machineVariable, value: series.value, time: series.time };
  }
}
