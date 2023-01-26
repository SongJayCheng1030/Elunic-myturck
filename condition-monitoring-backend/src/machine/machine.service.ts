import { Client, IManagedObject, Severity } from '@c8y/client';
import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { MachineState, MachineStateDto } from 'shared/common/models';

import { ConfigService } from '../config/config.service';
import { SeverityType } from '../machine-alert/machine-alert.entity';
import { MachineAlertDto } from '../machine-alert/MachineAlertDto';

interface CumulocityStateMapping {
  name: string;
  type: string;
  series: string;
}

const RELEVANT_CUMULOCITY_STATES: CumulocityStateMapping[] = [
  { name: 'tempOutside', type: 'c8y_TemperatureMeasurement', series: 'ambient' },
  { name: 'tempCabinetMx', type: 'c8y_TemperatureMeasurement', series: 'mxCc' },
  { name: 'tempCabinetCpe', type: 'c8y_TemperatureMeasurement', series: 'cpe1Cc' },
  { name: 'waterHardness', type: 'c5s_GermanHardness', series: 'cpaTt' },
  { name: 'tempPressureHull', type: 'c8y_TemperatureMeasurement', series: 'pv' },
  { name: 'pressureHull', type: 't3k_Pressure', series: 'pv' },
  { name: 'tempFeedingWater', type: 'c8y_TemperatureMeasurement', series: 'ft' },
  { name: 'operatingCondition', type: 't3k_OnOff', series: 'run' },
  { name: 'mode', type: 'c5s_StartMode', series: 'ma' },
];

interface TypeAndSeries {
  type: string;
  series: string;
}

@Injectable()
export class MachineService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    @InjectLogger(MachineService.name) private readonly logger: LogService,
  ) {}

  client!: Client;

  async onModuleInit(): Promise<void> {
    const { user, password, baseUrl, disabled } = this.configService.cumulocity;
    if (!disabled) {
      try {
        this.client = await Client.authenticate(
          {
            user,
            password,
          },
          baseUrl,
        );
      } catch (ex) {
        throw new InternalServerErrorException('Failed creating cumulocity connection');
      }
    }
  }

  async getCurrentState(deviceId: string): Promise<{ state: MachineState }> {
    const [{ data }, runState] = await Promise.all([
      this.client.inventory.detail(deviceId),
      this.getLastValue(deviceId, { type: 't3k_OnOff', series: 'run' }),
    ]);

    return { state: this.getMachineState(data, runState || 0) };
  }

  async getCurrentStates(deviceId: string): Promise<MachineStateDto[]> {
    if (this.configService.cumulocity.disabled) {
      // we should return mock data here
      return [];
    }

    const measurements = await Promise.all(
      RELEVANT_CUMULOCITY_STATES.map(async stateMapping => {
        const { name } = stateMapping;

        return {
          name,
          value: await this.getLastValue(deviceId, stateMapping),
        };
      }),
    );

    return measurements.filter(measurement => !!measurement) as MachineStateDto[];
  }

  async getActiveAlarms(source: string): Promise<MachineAlertDto[]> {
    const { data } = await this.client.alarm.list({
      source,
      status: 'ACTIVE',
      pageSize: 20,
    });
    return data.map(({ id, text, severity, creationTime }) => ({
      id: id?.toString() || '',
      text,
      code: '',
      severity: [Severity.CRITICAL, Severity.MAJOR].includes(severity)
        ? SeverityType.ERROR
        : SeverityType.WARNING,
      timestamp: creationTime || '',
    }));
  }

  private async getLastValue(
    source: string,
    { type, series }: TypeAndSeries,
  ): Promise<number | null> {
    const { data } = await this.client.measurement.list({
      source,
      valueFragmentType: type,
      valueFragmentSeries: series,
      // we need to start our search from a date in the past
      // after which some new value occured
      dateFrom: new Date('2022-03-01').toISOString(),
      dateTo: new Date().toISOString(),
      revert: true,
      pageSize: 1,
    });
    const [lastMeasurement] = data;
    if (!lastMeasurement) {
      return null;
    }
    return lastMeasurement[type][series].value;
  }

  private getMachineState(d: IManagedObject, mRun: number): MachineState {
    if (
      !d.c8y_RequiredAvailability ||
      d.c8y_RequiredAvailability.responseInterval === undefined ||
      d.c8y_RequiredAvailability.responseInterval <= 0 // maintenance mode, boiler not online on purpose
    ) {
      return MachineState.OFFLINE;
    } else if (d.c8y_Availability?.status !== 'AVAILABLE') {
      return MachineState.NOT_REACHABLE;
    } else if (
      d.c8y_ActiveAlarmsStatus.major > 0 ||
      d.c8y_ActiveAlarmsStatus.critical > 0 ||
      d.c8y_ActiveAlarmsStatus.minor > 0
    ) {
      // this check has to be executed after `d.c8y_Availability?.status`,
      // because unavailability always triggers a `major` alarm c8y_Unavailability and thus
      // incrementing `d.c8y_ActiveAlarmsStatus.major` to at least 1
      return MachineState.ERROR;
    } else if (d.c8y_ActiveAlarmsStatus.warning > 0) {
      if (mRun === 1) {
        return MachineState.RUNNING_WITH_WARNING;
      } else {
        return MachineState.STOPPED_WITH_WARNING;
      }
    } else {
      if (mRun === 1) {
        return MachineState.RUNNING;
      } else {
        return MachineState.STOPPED;
      }
    }
  }
}
