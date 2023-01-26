import { Client, IManagedObject } from '@c8y/client';
import { Injectable } from '@nestjs/common';

import { SensorDto, SensorType } from './device.dto';
import { DeviceSource } from './sources';

@Injectable()
export class C8yDeviceService extends DeviceSource {
  constructor(private readonly client: Client) {
    super();
  }

  async getAvailableDeviceIds(groupId: string): Promise<string[]> {
    const objs: IManagedObject[] = [];

    const filter = {
      pageSize: 100,
      withChildren: false,
      withGroups: true,
      withTotalPages: true,
      fragmentType: 'c8y_IsDevice',
      query: `bygroupid(${groupId})`,
    };

    let res = await this.client.inventory.list(filter);
    objs.push(...res.data);

    let nextPage = res.paging?.nextPage;

    while (typeof nextPage === 'number') {
      res = await this.client.inventory.list({
        ...filter,
        page: nextPage,
      });
      nextPage = res.paging?.nextPage;
      objs.push(...res.data);
    }
    return objs.map(t => t.id);
  }

  async getAvailableSensors(deviceId: string): Promise<SensorDto[]> {
    // TODO: Get other sensors types from different endpoints.
    const { data } = await this.client.inventory.detail(deviceId);
    const rawResult = await this.client.core
      .fetch(`/inventory/managedObjects/${data.id}/supportedSeries`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      .then(res => res.json() as Promise<{ c8y_SupportedSeries: string[] }>);
    return rawResult.c8y_SupportedSeries.map(s => ({
      id: s,
      type: SensorType.SERIES,
    }));
  }

  async getAvailableGroupIds(): Promise<string[]> {
    const objs: IManagedObject[] = [];

    const filter = {
      pageSize: 100,
      withChildren: false,
      withGroups: true,
      withTotalPages: true,
      type: 'c8y_DeviceGroup',
    };

    let res = await this.client.inventory.list(filter);

    objs.push(...res.data);

    let nextPage = res.paging?.nextPage;

    while (typeof nextPage === 'number') {
      res = await this.client.inventory.list({
        ...filter,
        page: nextPage,
      });
      nextPage = res.paging?.nextPage;
      objs.push(...res.data);
    }
    return objs.map(({ id }) => id);
  }
}
