import { Client, IManagedObject } from '@c8y/client';
import { Injectable } from '@nestjs/common';

import { GroupDto } from './dto/GroupDto';

@Injectable()
export class C8yGroupService {
  constructor(private readonly client: Client) {}

  async getGroups(): Promise<GroupDto[]> {
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
    return objs.map(({ id, name }) => ({ id, name }));
  }

  async getGroupById(id: string): Promise<GroupDto> {
    const { data } = await this.client.inventory.detail(id);
    return { id: data.id, name: data.name };
  }
}
