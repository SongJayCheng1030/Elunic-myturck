import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { asResponse } from 'shared/backend';

import { GrafanaBuildingsetService } from './grafana-buildingset.service';

@Controller('gf-buildingset/gf')
export class GrafanaBuildingsetController {
  constructor(private readonly grafanaBuildingsetService: GrafanaBuildingsetService) {}

  @Get('/dashboards')
  async getAllDashboards(@Query('query') query: string, @Req() req: Request) {
    const results = await this.grafanaBuildingsetService.getDashboards(req.auth, query);
    return asResponse(results);
  }

  @Get('/dashboards/:id/panels')
  async getAllPanelsForDashboard(@Param('id') id: string, @Req() req: Request) {
    const results = await this.grafanaBuildingsetService.getPanelsByDashboardId(req.auth, id);
    return asResponse(results);
  }

  @Get('/dashboards/grouped')
  async getAllDashboardsGrouped(@Req() req: Request) {
    const results = await this.grafanaBuildingsetService.getDashboardsGrouped(req.auth);
    return asResponse(results);
  }
}
