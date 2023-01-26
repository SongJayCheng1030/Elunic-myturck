import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthInfo } from 'shared/common/types';
import { SharedAssetService } from 'shared/nestjs/services/shared-asset.service';
import { Repository } from 'typeorm';
import urljoin = require('url-join');

import { ConfigService } from '../config/config.service';
import { DYNAMIC_GF_PANEL_TAG, GRAFANA_PATH } from '../definitions';
import { MachineVariableEntity } from '../machine-variable/machine-variable.entity';
import { MachineVariableService } from '../machine-variable/machine-variable.service';
import { toExternal } from '../machine-variable/MachineVariableDto';
import { GrafanaService } from '../organization/grafana.service';
import { OrganizationService } from '../organization/organization.service';
import { GrafanaDashboardDto } from './dto/GrafanaDashboardDto';
import { GrafanaPanelDto } from './dto/GrafanaPanelDto';
import { TileDto } from './dto/TileDto';
import { GrafanaTileEntity } from './grafana-tile.entity';

@Injectable()
export class GrafanaBuildingsetService {
  constructor(
    private readonly sharedAssetService: SharedAssetService,
    private readonly grafanaService: GrafanaService,
    private readonly orgService: OrganizationService,
    @InjectRepository(GrafanaTileEntity)
    private readonly tileRepo: Repository<GrafanaTileEntity>,
    @InjectLogger(GrafanaBuildingsetService.name)
    private readonly logger: Logger,
    private readonly config: ConfigService,
    private readonly machineVariableService: MachineVariableService,
  ) {}

  async getDashboards(authInfo: AuthInfo, query?: string): Promise<GrafanaDashboardDto[]> {
    this.logger.debug(`getDashboards(tenantId=${authInfo.tenantId}): query=${query}`);
    const org = await this.orgService.getOneByTenantId(authInfo.tenantId);
    const all = await this.grafanaService.getDashboards(org.id, query);
    this.logger.debug(`found ${all.length} results`);

    return all
      .sort((a, b) => {
        const scorea = (a.sortMeta || 0) + (a.isStarred ? 100 : 0);
        const scoreb = (b.sortMeta || 0) + (b.isStarred ? 100 : 0);

        if (scorea === scoreb) {
          return a.title.localeCompare(b.title);
        }
        return scorea - scoreb;
      })
      .map(raw => ({
        dashboardId: raw.uid,
        title: raw.title,
        slug: raw.slug || undefined,
      }));
  }

  async getDashboardsGrouped(authInfo: AuthInfo): Promise<any> {
    const org = await this.orgService.getOneByTenantId(authInfo.tenantId);
    const all = await this.grafanaService.getDashboards(org.id);
    const dashboardsWithPanels = await Promise.all(
      all.map(async d => ({
        dashboard: d,
        panels: await this.getPanelsByDashboardId(org.id, d.uid),
      })),
    );

    const ret: any[] = [];

    for (const db of dashboardsWithPanels) {
      for (const panel of db.panels || []) {
        const tags = this.grafanaService.parseGfDashboardTags(db.dashboard.tags);

        ret.push({
          gfDashboardId: db.dashboard.uid,
          gfPanelId: panel.panelId,
          title: panel.title,
          dashboardTitle: db.dashboard.title,
          dashboardSlug: db.dashboard.slug || undefined,
          isDynamicDashboard: Object.keys(tags).includes(DYNAMIC_GF_PANEL_TAG),
          tags,
          orderIndex: db.dashboard.sortMeta || 0,
          isStarred: db.dashboard.isStarred,
          ids: {
            gfDashboardId: db.dashboard.uid,
            gfPanelId: panel.panelId,
          },
          uid: `${db.dashboard.uid}:${panel.panelId}`,
        });
      }
    }

    return ret;
  }

  async getPanelsByDashboardId(
    authInfoOrOrgId: AuthInfo | string,
    id: string,
  ): Promise<GrafanaPanelDto[]> {
    const org =
      typeof authInfoOrOrgId === 'string'
        ? { id: authInfoOrOrgId }
        : await this.orgService.getOneByTenantId(authInfoOrOrgId.tenantId);
    const dashboard = await this.grafanaService.getDashboardByUid(org.id, id);

    return (dashboard.dashboard.panels || [])
      .filter(raw => !!raw.type)
      .sort((a, b) => `${a.title || ''}`.localeCompare(`${b.title || ''}`))
      .map(raw => ({
        panelId: raw.id,
        title: raw.title || '',
      }));
  }

  async findByAssetId(
    authInfo: AuthInfo,
    assetId: string,
    facadeId: string,
  ): Promise<GrafanaTileEntity[]> {
    const asset = await this.sharedAssetService.getById(authInfo, assetId);

    return await this.tileRepo.find({
      where: [
        {
          tenantId: authInfo.tenantId,
          assetId: asset.id,
          facadeId,
        },
        {
          tenantId: authInfo.tenantId,
          assetTypeId: asset.assetType.id,
          facadeId,
        },
      ],
      relations: ['machineVariable'],
      order: {
        orderIndex: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findByAssetTypeId(
    authInfo: AuthInfo,
    assetTypeId: string,
    facadeId: string,
  ): Promise<GrafanaTileEntity[]> {
    return await this.tileRepo.find({
      where: [
        {
          tenantId: authInfo.tenantId,
          assetTypeId,
          facadeId,
        },
      ],
      relations: ['machineVariable'],
      order: {
        orderIndex: 'ASC',
        name: 'ASC',
      },
    });
  }

  async createTileByAssetType(
    authInfo: AuthInfo,
    assetId: string,
    dto: TileDto,
    facadeId: string,
  ): Promise<GrafanaTileEntity> {
    const entity = this.tileRepo.create();
    const machineVariableId =
      typeof dto.machineVariable === 'string' ? dto.machineVariable : dto.machineVariable?.id;
    const machineVariable = await this.machineVariableService.findOne(machineVariableId);
    if (!machineVariable) {
      throw new NotFoundException(`No such machine existing`);
    }

    await this.mapFromTileDto(authInfo, dto, entity, assetId, facadeId, machineVariable);
    await this.tileRepo.save(entity, { reload: true });

    const tile = await this.tileRepo.findOne({
      where: {
        id: entity.id,
        tenantId: authInfo.tenantId,
      },
      relations: ['machineVariable'],
    });

    if (!tile) {
      throw new NotFoundException(`No such tile existing`);
    }

    return tile;
  }

  async updateTile(
    authInfo: AuthInfo,
    assetId: string,
    tileId: string,
    dto: TileDto,
    facadeId: string,
  ): Promise<GrafanaTileEntity> {
    const tile = await this.tileRepo.findOne({
      where: {
        id: tileId,
        tenantId: authInfo.tenantId,
      },
      relations: ['machineVariable'],
    });

    if (!tile) {
      throw new NotFoundException(`No such tile existing`);
    }
    const machineVariableId =
      typeof dto.machineVariable === 'string' ? dto.machineVariable : dto.machineVariable?.id;
    const machineVariable = await this.machineVariableService.findOne(machineVariableId);
    if (!machineVariable) {
      throw new NotFoundException(`No such machine existing`);
    }

    await this.mapFromTileDto(authInfo, dto, tile, assetId, facadeId, machineVariable);
    await this.tileRepo.save(tile, { reload: true });
    return tile;
  }

  async deleteTileById(authInfo: AuthInfo, tileId: string, facadeId: string): Promise<void> {
    const tile = await this.tileRepo.findOne({
      where: {
        id: tileId,
        tenantId: authInfo.tenantId,
        facadeId,
      },
    });

    if (!tile) {
      throw new NotFoundException(`No such tile existing`);
    }

    await this.tileRepo.delete(tile.id);
  }

  async toTileDto(
    authInfo: AuthInfo,
    tile: GrafanaTileEntity,
    currentAssetId: string,
  ): Promise<TileDto> {
    const org = await this.orgService.getOneByTenantId(authInfo.tenantId);
    const dashboard = await this.grafanaService.getDashboardByUid(org.id, tile.gfDashboardId);

    return {
      id: tile.id,
      name: tile.name,
      machineVariable: tile?.machineVariable ? toExternal(tile?.machineVariable) : undefined,
      isOnAssetType: tile.assetTypeId !== null,
      gfDashboardId: tile.gfDashboardId,
      gfPanelId: tile.gfPanelId,
      width: tile.widthUnits,
      height: tile.heightUnits,
      order: tile.orderIndex,
      createdAt: tile.createdAt.toISOString(),
      updatedAt: tile.updatedAt.toISOString(),
      useVars: tile.useVars,
      useOwnVars: tile.useOwnVars,
      gfEmbed: {
        url: urljoin(
          this.config.externalServiceUrl,
          GRAFANA_PATH,
          `d-solo/${dashboard?.dashboard.uid}/${dashboard?.meta.slug}`,
        ),
        params: [
          {
            type: 'const',
            name: 'orgId',
            defaultValue: org.id,
          },
          {
            type: 'const',
            name: 'panelId',
            defaultValue: tile.gfPanelId,
          },
          {
            type: 'refresh',
            name: 'refresh',
            defaultValue: '1m',
          },
          {
            type: 'timeFrom',
            name: 'from',
            defaultValue: '',
          },
          {
            type: 'timeTo',
            name: 'to',
            defaultValue: '',
          },
          {
            type: 'const',
            name: 'theme',
            defaultValue: 'light',
          },
          {
            type: 'var',
            name: 'var-parameter',
            defaultValue: tile.machineVariable?.parameterId,
          },
        ],
      },
    } as TileDto;
  }

  private async mapFromTileDto(
    authInfo: AuthInfo,
    dto: TileDto,
    entity: GrafanaTileEntity,
    assetTypeId: string,
    facadeId: string,
    machineVariable: MachineVariableEntity,
  ) {
    entity.name = dto.name;
    entity.machineVariable = machineVariable;
    entity.isMagicTile = dto.isMagicTile || false;
    entity.gfDashboardId = dto.gfDashboardId;
    entity.gfPanelId = dto.gfPanelId;
    entity.widthUnits = dto.width;
    entity.heightUnits = dto.height;
    entity.orderIndex = dto.order;
    entity.tenantId = authInfo.tenantId;
    entity.facadeId = facadeId;
    entity.useVars = dto.useVars;
    entity.useOwnVars = dto.useOwnVars;
    entity.assetTypeId = assetTypeId;
  }
}
