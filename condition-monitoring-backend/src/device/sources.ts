import { Logger } from '@elunic/logger';
import { InfluxDB } from '@influxdata/influxdb-client';
import { OrgsAPI, TasksAPI } from '@influxdata/influxdb-client-apis';
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';

import { ConfigService } from '../config/config.service';
import { GrafanaDataSource } from '../organization/grafana.service';
import { DataSinkDto, SensorDto, SensorWithConfigDto, SinkConfig } from './device.dto';

export function sanitizeSensorId(id: string): string {
  return id.replace('.', '-');
}

@Injectable()
export abstract class DeviceSource {
  abstract getAvailableDeviceIds(groupId: string): Promise<string[]>;
  abstract getAvailableSensors(deviceId: string): Promise<SensorDto[]>;
  abstract getAvailableGroupIds(): Promise<string[]>;
}

@Injectable()
export abstract class DataSink<T = GrafanaDataSource> implements OnModuleInit {
  abstract readonly type: string;
  abstract readonly public: boolean;
  protected orgId!: string;

  constructor(
    protected readonly influxDb: InfluxDB,
    protected readonly config: ConfigService,
    protected readonly logger: Logger,
  ) {}

  abstract connect(sink: DataSinkDto, sensor: SensorWithConfigDto): Promise<void>;
  abstract getGrafanaConfig(orgId: string, sinkIds: string[]): Promise<T>;
  abstract updateGrafanaConfig(orgId: string, sinkIds: string[]): Promise<Partial<T> | undefined>;
  abstract createSink(deviceId: string, config: SinkConfig): Promise<DataSinkDto>;
  abstract cascade(source: DataSinkDto, sink: DataSinkDto, interval: number): Promise<void>;

  async onModuleInit() {
    this.logger.info(`Init data sink ${this.type}`);
    const orgsApi = new OrgsAPI(this.influxDb);
    const { orgs } = await orgsApi.getOrgs({ org: this.config.influx.org });
    const org = orgs?.find(o => o.name === this.config.influx.org);
    if (!org) {
      throw new Error('Org not found');
    }
    this.orgId = org.id as string;
  }

  protected async taskExists(name: string): Promise<boolean> {
    const tasksApi = new TasksAPI(this.influxDb);
    const tasks = await tasksApi.getTasks({ name });
    return !!tasks.tasks?.some(t => t.name === name);
  }

  protected async createTask(flux: string): Promise<string> {
    const tasksApi = new TasksAPI(this.influxDb);
    const { id } = await tasksApi.postTasks({
      body: {
        org: this.config.influx.org,
        flux,
        status: 'active',
      },
    });

    let taskRun = await tasksApi.postTasksIDRuns({
      taskID: id,
      body: {},
    });

    let i = 0;
    while (taskRun.status === 'scheduled' || i < 5) {
      taskRun = await tasksApi.getTasksIDRunsID({
        runID: taskRun.id as string,
        taskID: id,
      });
      await new Promise(res => setTimeout(res, 1000));
      i++;
    }

    if (taskRun.status === 'failed') {
      await tasksApi.deleteTasksID({ taskID: id });
      throw new BadRequestException(
        'Task configuration',
        taskRun.log?.map(l => l.message).join(''),
      );
    }

    return taskRun.id as string;
  }
}
