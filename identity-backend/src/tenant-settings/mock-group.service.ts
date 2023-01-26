import { Injectable } from '@nestjs/common';
import { AuthInfo } from 'shared/common/types';

import { GroupDto } from './dto/GroupDto';

@Injectable()
export class MockGroupService {
  constructor() {}

  async getAvailableGroups(auth: AuthInfo): Promise<GroupDto[]> {
    return [1, 2, 3].map(id => ({
      name: `Mock Group ${id}`,
      id: `mock-group-${id}`,
    }));
  }
}
