import { Module } from '@nestjs/common';

import { OrganizationModule } from '../organization/organization.module';
import { GrafanaProxyController } from './grafana-proxy.controller';
import { GrafanaProxyService } from './grafana-proxy.service';

@Module({
  imports: [OrganizationModule],
  providers: [GrafanaProxyService],
  controllers: [GrafanaProxyController],
})
export class GrafanaProxyModule {}
