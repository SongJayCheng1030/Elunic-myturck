import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { GrafanaProxyService } from './grafana-proxy.service';

@Controller('grafana')
export class GrafanaProxyController {
  constructor(private readonly proxyService: GrafanaProxyService) {}

  @All('/')
  async redirect(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.proxyService.proxyRequest(req, res);
  }
}
