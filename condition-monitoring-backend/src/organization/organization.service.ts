import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantId } from 'shared/common/types';
import { Repository } from 'typeorm';

import { GrafanaService } from './grafana.service';
import { OrganizationDto } from './organization.dto';
import { OrganizationEntity } from './organization.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectLogger(OrganizationService.name) private readonly logger: LogService,
    @InjectRepository(OrganizationEntity) private readonly repo: Repository<OrganizationEntity>,
    private readonly grafana: GrafanaService,
  ) {}

  async getOne(id: string): Promise<OrganizationDto> {
    const { tenantId, devices } = await this.repo.findOneOrFail(id, { relations: ['devices'] });
    const org = await this.grafana.getOrg(id);
    return { ...org, tenantId, devices, id: String(org.id) };
  }

  async getOneByTenantId(tenantId: TenantId): Promise<OrganizationDto> {
    const { id } = await this.repo.findOneOrFail({ where: { tenantId }, relations: ['devices'] });
    return this.getOne(id);
  }

  async getMany(): Promise<OrganizationDto[]> {
    const orgs = await this.grafana.getOrgs();
    const entities = await this.repo.findByIds(orgs.map(o => o.id) || [], {
      relations: ['devices'],
    });
    return entities.map(
      e =>
        ({
          ...e,
          ...orgs.find(o => String(o.id) === e.id),
          tenantId: e.tenantId,
        } as OrganizationDto),
    );
  }

  // async createOne(authInfo: AuthInfo, dto: CreateOrganizationDto): Promise<OrganizationDto> {
  //   const deviceIds = await this.deviceService.getAvailableIds();
  //   if (intersection(deviceIds, dto.deviceIds).length < dto.deviceIds.length) {
  //     throw new NotFoundException('At least one of the device does not exits');
  //   }
  //   const org = await this.grafana.createOrg(dto.name);
  //   const orgId = String(org.id);

  //   // Create the mapping of our internal tenant id to the grafana organization.
  //   await this.repo.save({
  //     id: orgId,
  //     tenantId: dto.tenantId,
  //     ownerId: authInfo.id,
  //   });

  //   const devices = await this.deviceService.createMany(orgId, dto.deviceIds);

  //   // Only crate tokens if there are any buckets. If we create a token without permission
  //   // the token will have full access. We dont want that.
  //   if (dto.deviceIds.length) {
  //     const config = await this.deviceService.getGrafanaConfig(
  //       dto.name,
  //       devices.map(d => d.id),
  //     );
  //     const dataSourceId = await this.grafana.createDataSource(orgId, config);
  //     await this.repo.update(orgId, { dataSourceId });
  //   }

  //   return this.getOne(orgId);
  // }

  // async updateOne(id: string, dto: Partial<CreateOrganizationDto>): Promise<OrganizationDto> {
  //   const org = await this.getOne(id);
  //   if (dto.name) {
  //     await this.grafana.updateOrg(org.id, dto.name);
  //   }
  //   if (dto.deviceIds && dto.deviceIds.length) {
  //     const devices = await this.deviceService.createMany(org.id, dto.deviceIds);
  //     const config = await this.deviceService.getGrafanaConfig(
  //       dto.name || org.name,
  //       devices.map(d => d.id),
  //     );
  //     await this.grafana.createDataSource(org.id, config);
  //   }
  //   return this.getOne(org.id);
  // }

  async deleteOne(id: string): Promise<void> {
    await this.repo.findOneOrFail(id);
    await this.grafana.deleteOrg(id);
    await this.repo.delete(id);
  }
}
