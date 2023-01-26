import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantMigration } from 'shared/nestjs';
import { Repository } from 'typeorm';

import {
  SETTING__AVAILABILITY_KPI_GOAL,
  SETTING__OEE_KPI_GOAL,
  SETTING__OEE_MONITORING_DETAILS_THRESHOLD,
  SETTING__THROUGHPUT_THRESHOLD,
  SETTING__UTILIZATION_KPI_GOAL,
  SETTING__YIELD_KPI_GOAL,
} from '../../definitions';
import { SettingEntity } from '../settings.entity';

const SETTINGS = [
  {
    key: SETTING__OEE_KPI_GOAL,
    value: '85',
    description:
      'For OEE Monitoring. Sets the threshold value in percent (0-100) after which oee is considered high or low.',
  },
  {
    key: SETTING__YIELD_KPI_GOAL,
    value: '85',
    description:
      'For OEE Monitoring. Sets the threshold value in percent (0-100) after which yield is considered high or low.',
  },
  {
    key: SETTING__AVAILABILITY_KPI_GOAL,
    value: '85',
    description:
      'For OEE Monitoring. Sets the threshold value in percent (0-100) after which availability is considered high or low.',
  },
  {
    key: SETTING__UTILIZATION_KPI_GOAL,
    value: '85',
    description:
      'For OEE Monitoring. Sets the threshold value in percent (0-100) after which utilization is considered high or low.',
  },
  {
    key: SETTING__THROUGHPUT_THRESHOLD,
    value: '1000',
    description:
      'The threshold after which the throughput is considered as "high". If the value is equal or lower it is considered as "low".',
  },
  {
    key: SETTING__OEE_MONITORING_DETAILS_THRESHOLD,
    value: '7',
    description:
      'Value in days. If less then the given amount of days is selected as the timeframe on the OEE Monitoring details page, the aggregation level is changed from days to hours.',
  },
];

@Injectable()
export class TenantMigrationInitSettings001 implements TenantMigration {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly repo: Repository<SettingEntity>,
  ) {}

  async getName(): Promise<string> {
    return '001-InitSettings';
  }

  async up(tenantId: string): Promise<void> {
    for (const setting of SETTINGS) {
      const n = await this.repo.count({
        where: {
          tenantId,
          key: setting.key,
        },
      });

      if (n < 1) {
        const newData = this.repo.create({
          key: setting.key,
          description: setting.description,
          value: setting.value,
          tenantId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await this.repo.save(newData);
      }
    }
  }
}
