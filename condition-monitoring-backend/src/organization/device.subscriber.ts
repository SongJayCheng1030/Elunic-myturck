import { Injectable } from '@nestjs/common';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';

import { DataSinkEntity } from '../device/data-sink.entity';
import { DeviceEntity } from '../device/device.entity';
import { DeviceService } from '../device/device.service';
import { GrafanaService } from './grafana.service';

@Injectable()
@EventSubscriber()
export class DeviceSubscriber implements EntitySubscriberInterface<DataSinkEntity> {
  constructor(
    connection: Connection,
    private readonly grafana: GrafanaService,
    private readonly deviceService: DeviceService,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return DataSinkEntity;
  }

  async afterInsert(event: InsertEvent<DataSinkEntity>) {
    await this.update(event);
  }

  async beforeRemove(event: RemoveEvent<DataSinkEntity>) {
    await this.update(event);
  }

  private async update(event: InsertEvent<DataSinkEntity> | RemoveEvent<DataSinkEntity>) {
    if (event.entity) {
      const deviceRepo = event.manager.getRepository(DeviceEntity);
      const sinkRepo = event.manager.getRepository(DataSinkEntity);

      const device = await deviceRepo.findOneOrFail(event.entity.deviceId);
      const orgId = device.organizationId;
      const sinks = await sinkRepo.find({
        where: { device: { organization: { id: orgId } } },
        relations: ['device', 'device.organization'],
      });

      const dataSources = await this.grafana.getDataSources(orgId);

      if (dataSources.length) {
        for (const source of dataSources) {
          const config = await this.deviceService.updateGrafanaConfig(orgId, source.type, sinks);
          if (config) {
            await this.grafana.updateDataSource(orgId, source.id, config);
          }
        }
      } else {
        const configs = await this.deviceService.getGrafanaConfigs(orgId, sinks);
        await Promise.all(configs.map(c => this.grafana.createDataSource(orgId, c)));
      }
    }
  }
}
