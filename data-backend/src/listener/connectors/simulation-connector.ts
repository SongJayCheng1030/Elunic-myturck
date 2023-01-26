import { Logger } from '@elunic/logger';
import { Injectable } from '@nestjs/common';
import { cloneDeep } from 'lodash';
import { MeasurementMessage } from 'src/listener/model';

import { ConfigService } from '../../config/config.service';
import { Connector } from './connector';

type Param =
  | { type: 'number'; min: number; max: number; unit: string }
  | { type: 'boolean'; probability: number };
// | { type: 'string'; alternatives: string[] };
const PARAMETERS: Record<string, Record<string, Param>> = {
  c8y_TemperatureMeasurement: {
    ambient: {
      type: 'number',
      min: 5,
      max: 50,
      unit: '°C',
    },
    mxCc: {
      type: 'number',
      min: 20,
      max: 100,
      unit: '°C',
    },
  },
  t3k_OnOff: {
    run: {
      type: 'boolean',
      probability: 0.5,
    },
  },
  // ['alarm/minor']: {
  //   type: 'string',
  //   alternatives: ['Minor alarm #1', 'Minor alarm #2', 'Minor alarm #3'],
  // },
  // ['alarm/major']: {
  //   type: 'string',
  //   alternatives: ['Major alarm #1', 'Major alarm #2', 'Major alarm #3'],
  // },
};

@Injectable()
export class SimulatorConnector extends Connector {
  private interval?: NodeJS.Timeout;

  constructor(private config: ConfigService, logger: Logger) {
    super(logger);
  }

  async init(): Promise<void> {
    this.logger.info('Simulation init');
  }

  async listen(): Promise<void> {
    if (this.interval) {
      return;
    }

    const { numDevices, emitInterval } = this.config.simulation;

    this.logger.warn(
      `Starting simulation of ${numDevices} devices. Emitting every ${emitInterval}ms`,
    );

    const devices = (Array(numDevices).fill(null) as null[]).reduce(
      (prev, curr, i) => ({
        ...prev,
        [i]: {
          id: 'simulation' + (i + 1),
          params: cloneDeep(PARAMETERS),
        },
      }),
      {} as Record<string, { id: string; params: Record<string, Record<string, Param>> }>,
    );

    this.interval = setInterval(() => {
      for (const device of Object.values(devices)) {
        const body: MeasurementMessage = {
          ...this.getRandomMessage(device.params),
          source: device.id,
        };

        this.processMessage({ ...body, topic: `c8y/${device.id}/measurements` });
      }
    }, emitInterval);
  }

  async unlisten(): Promise<void> {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  private getRandomMessage(
    params: Record<string, Record<string, Param>>,
  ): Omit<MeasurementMessage, 'source'> {
    const keys = Object.keys(params);
    const parameterId = keys[(keys.length * Math.random()) << 0];
    const param = params[parameterId];

    const innerKeys = Object.keys(param);
    const innerParameterId = innerKeys[(innerKeys.length * Math.random()) << 0];
    const innerParam = param[innerParameterId];

    const id = (Math.random() * 100000).toString();
    const time = Date.now() / 1000;
    const body: Omit<MeasurementMessage, 'measurements' | 'source'> = {
      creationTime: time,
      id,
      'source.type': 'com_cumulocity_model_idtype_GId',
      tenantId: 't55172995',
      'source.name': null,
      'source.value': id,
      type: parameterId,
      time,
    };

    switch (innerParam.type) {
      case 'number':
        return {
          ...body,
          measurements: {
            [parameterId]: {
              [innerParameterId]: {
                value:
                  Math.floor(
                    1000 * Math.random() * (innerParam.max - innerParam.min) + innerParam.min,
                  ) / 1000,
                unit: innerParam.unit,
              },
            },
          },
        };
      case 'boolean':
        return {
          ...body,
          measurements: {
            [parameterId]: {
              [innerParameterId]: {
                value: Math.random() < innerParam.probability ? 1 : 0,
              },
            },
          },
        };
      default:
        throw Error('Unknown type');
    }
  }
}
