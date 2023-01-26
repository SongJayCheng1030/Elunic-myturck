import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantMigration } from 'shared/nestjs';
import { Repository } from 'typeorm';

import { FacadeEntity } from '../facade.entity';

export const FACADES_DATA = [
  {
    id: '9298affc-f09a-4ba4-a926-15057d680062',
    name: {
      de_DE: 'Alarmübersicht',
      en_US: 'Alarm Management',
    },
    type: 'GRAFANA_BUILDING_SET',
    path: 'alarm-management',
    icon:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAkCAYAAADl9UilAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAJqADAAQAAAABAAAAJAAAAADd+lEBAAACuklEQVRYCcVY73XTMBC/U/hOR2gmaLpBN8AkfCbOBHQD0gkoEzju94YwQV8nACagTEAYoD7upIdrufprG7j3kli60+mX051+shDGyqp+B0AlAC6MKzpwu4bbDf8OFxw8tKhOYIZ3T4B6noh2sC83vd7kpkq27BvOsPKCElvEEpY3l/1hqe1hEVtVBYD6FJ2E6AgNncNh8xC17RkMixjhh54fdxORl1tt3cpwbz6w5U3Jy3Qadmtp11BUOfZ6cB4wSXho0qLVxabzsdsRf84DptQlR4vB5QpewJvqImdUOjAdLeI9a6AQvs8ZmQ5MktgfrRoemzl/zoHgmxsAR01Xs1vb703bLiR5Z+p7f7BuC5D9etHq9Marfrbt7gPRA2+6826X7zktYuGSP1rODxu73VVKNUtVJ0gcmEnadYKvRBOuap2vYfM4sMykDU/HWslTqe6IhIHpaHHSTi5c3ZGohYE1QtR/QQxVXYc8+4HlU09oHpcuSFVuYDrMTdaG6Jo52jfzHwbcwAz1nEYdjzbAwkdVz4HpaI2gnlywnqp/DixMPbnTJti7qcoGZs5Nw4k6AYbTxHHwtIGFqcfpc5JOB1U9ASuqBU8ygHrozDqhZpwg7D9lU9WLVhko3dbG9aApBr7Acrdj9QlzTukyi/ZpPyhUtRVblC9dsqTu9PP//DJvVXN+qzqapXQkXzY+OZcR/Mge1x1gqGorXajPR0gjObF53V4JrGrhwHGVzadhBUiFIBwsBPctKHFyu5Y8GSdqVshSvhrlBemlNT5ynLFsvQ3SwLzqNAXf8nSPy8pPzGn+jBXnWP2VM+0sZ5DTVipKknca+chLiZKs42U6UMCvgdcK9m93XOb345FN5IHgSm6HzD7WNFKZnydyPdAN/eIAXfE76lYcmJ3/jyvhS6UE5D8W5Hu0x0P3Hu03TH+w9gYd9kkAAAAASUVORK5CYII=',
  },
];

/**
 * TODO: FIXME
 *
 * +++ WARNING +++
 * This migration needs to be changed for future real Multi-Tenant handling
 * of Grafana and the Grafana Buildingset.
 * Currently the same config is rolled out over and over again for every new
 * tenant!
 */
@Injectable()
export class TenantMigrationInitGfbsFacade003 implements TenantMigration {
  constructor(
    @InjectRepository(FacadeEntity)
    private readonly repo: Repository<FacadeEntity>,
  ) {}

  async getName(): Promise<string> {
    return '003-InitGfbsFacade003';
  }

  async up(tenantId: string): Promise<void> {
    for (const facade of FACADES_DATA) {
      const entity = this.repo.create({
        iconUrl: facade.icon,
        name: facade.name,
        tenantId,
        // @ts-ignore
        type: facade.type as any,
        urlPath: facade.path,
      });
      await this.repo.save(entity);
    }
  }
}
