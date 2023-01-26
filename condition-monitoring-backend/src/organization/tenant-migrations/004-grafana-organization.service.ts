import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantMigration } from 'shared/nestjs';
import { Repository } from 'typeorm';

import { GrafanaService } from '../grafana.service';
import { OrganizationEntity } from '../organization.entity';
import { initialDashboardConfig } from './initial-grafana-dashboard';

@Injectable()
export class TenantMigrationGrafanaOrganization004 implements TenantMigration {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly repo: Repository<OrganizationEntity>,
    private readonly grafana: GrafanaService,
  ) {}

  async getName(): Promise<string> {
    return '004-GrafanaOrganization';
  }

  async up(tenantId: string): Promise<void> {
    const org = await this.grafana.createOrg(tenantId);
    const orgId = String(org.id);

    await this.repo.save({
      id: orgId,
      ownerId: '00000000-0000-0000-0000-000000000000',
      devices: [],
      tenantId,
    });

    const sqlDatasourceConfig = await this.grafana.getGrafanaConfig(orgId);

    const datasourceId = await this.grafana.createDataSource(orgId, sqlDatasourceConfig);

    await this.grafana.createDashboard(orgId, initialDashboardConfig(datasourceId));
  }
}
