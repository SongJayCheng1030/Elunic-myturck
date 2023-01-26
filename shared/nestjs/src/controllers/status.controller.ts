import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { PromMetricsService } from '../services/prom-metrics.service';

@Controller()
export class StatusController {
  constructor(private readonly metrics: PromMetricsService) {}

  @Get('/status')
  async getStatus(@Req() req: Request, @Res() res: Response) {
    await this.serveStatusPage(req, res);
    res.end();
  }

  @Get('/v1/status')
  async getV1Status(@Req() req: Request, @Res() res: Response) {
    await this.serveStatusPage(req, res);
    res.end();
  }

  // ---

  private async serveStatusPage(req: Request, res: Response): Promise<void> {
    // Provide the plain HTML page
    if (!req.query.prom) {
      res.setHeader('Content-Type', 'text/html');
      res.write(this.getHtmlStatusPage());
      return;
    }

    // Write Prometheus scrape data
    res.setHeader('Content-Type', this.metrics.getMetricsContentType());
    res.write(await this.metrics.getMetrics());
  }

  private getHtmlStatusPage() {
    return `<html>
      <head>
        <title>Service available: ${this.metrics.getServiceName()} - OK</title>
      </head>
      <body>
        <h1>Service available</h1>
        <p>The ${this.metrics.getServiceName()} service is fully operational and currently
        ready to accept new requests.</p>
        <p>Memory used: ${this.metrics.getCurrentRssMb()}, uptime: ${this.metrics.getUptimeSecs()} s.</p>
        <hr/>
        <i>Served by ${this.metrics.getServiceName()} v.${this.metrics.getServiceVersion()} on ${
      process.platform
    }</i>
      </body>
    </html>`;
  }
}
