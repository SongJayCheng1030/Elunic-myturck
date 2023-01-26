import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { ForbiddenException, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as AsyncLock from 'async-lock';
import { Request, Response } from 'express';
import { Server, ServerResponse } from 'http';
import * as httpProxy from 'http-proxy';
import * as NodeCache from 'node-cache';
import { AuthInfo } from 'shared/common/types';
import { injectAuth, SioRights } from 'shared/nestjs';

import { ConfigService } from '../config/config.service';
import { GRAFANA_PATH } from '../definitions';
import { GrafanaService } from '../organization/grafana.service';
import { OrganizationService } from '../organization/organization.service';

interface CacheContent {
  name: string;
  tenantId: string;
}

@Injectable()
export class GrafanaProxyService implements OnApplicationBootstrap {
  private cache = new NodeCache({ stdTTL: 300 });
  private proxy = this.getProxy();
  private lock = new AsyncLock({ timeout: 5000 });

  constructor(
    private readonly orgService: OrganizationService,
    private readonly grafana: GrafanaService,
    private readonly config: ConfigService,
    private readonly adapterHost: HttpAdapterHost,
    @InjectLogger(GrafanaProxyService.name)
    private readonly logger: Logger,
  ) {}

  onApplicationBootstrap() {
    const app = this.adapterHost.httpAdapter.getHttpServer() as Server;

    app.on('upgrade', async (req: Request, socket, head) => {
      // Only upgrade requests for grafana live api.
      if (req.url.startsWith(`${GRAFANA_PATH}/api/live`)) {
        // req.auth would be missing here if we dont inject it manually. The middleware does not apply here.
        injectAuth(req);
        // Rewrite the path manually too.
        req.url = req.url.replace(GRAFANA_PATH, '');

        const headers = await this.getHeaders(req);

        // Add required websocket headers.
        headers['Upgrade'] = req.headers['upgrade'] as string;
        headers['Connection'] = req.headers['connection'] === '' ? 'close' : 'upgrade';

        this.proxy.ws(req, socket, head, { prependPath: false, headers });
      }
    });
  }

  async proxyRequest(req: Request, res: Response): Promise<void> {
    const headers = await this.getHeaders(req);
    req.url = req.url.replace(GRAFANA_PATH, '');
    this.proxy.web(req, res, { headers, prependPath: false });
  }

  private async getOrCreateUser(auth: AuthInfo): Promise<string> {
    let existing = this.cache.get<CacheContent>(auth.id);

    if (existing && existing.tenantId !== auth.tenantId) {
      // Clear cache and redo if cached user changed tenant.
      this.cache.del(auth.id);
      existing = undefined;
    }

    if (!existing) {
      const user = await this.grafana.getUser(auth.name).catch(() => null);
      const org = await this.orgService.getOneByTenantId(auth.tenantId);

      const orgId = Number(org.id);

      if (!user) {
        this.logger.info(
          `Creating new grafana user for user ${auth.id} (${auth.name}) in org grafana ${orgId}`,
        );
        // We have to create the user in grafana first before we can proxy.
        if (auth.isMultiTenantAdmin) {
          this.logger.info(`Make user ${auth.id} an global grafana admin`);
          // A new global grafana admin
          await this.grafana.createAdmin(auth.name, auth.email || undefined);
          await this.grafana.addToOrg({ username: auth.name, role: 'Admin' }, orgId);
        } else {
          await this.grafana.createUser({
            username: auth.name,
            email: auth.email || undefined,
            orgId,
            role: auth.rights.includes(SioRights.GrafanaUse) ? 'Editor' : 'Viewer',
          });
        }
      } else if (user.orgId !== orgId) {
        // Org changed.
        if (!auth.isMultiTenantAdmin) {
          // But not a multitenant user, that is not allowed.
          throw new ForbiddenException('Wrong tenant');
        } else {
          // Get all the orgs this user has access to.
          this.logger.info(`User ${auth.id} tenant switch detected. Propagating it to grafana.`);
          this.logger.info(`User ${auth.id} was previous in org ${user.orgId}, now ${orgId}`);
          const userOrgIds = await this.grafana.getUserOrgs(user.id);
          if (!userOrgIds.includes(orgId)) {
            // Make sure he is part of the current org.
            await this.grafana.addToOrg({ username: auth.name, role: 'Admin' }, orgId);
          }

          // Remove all the other orgs so the shopfloor tenant switch remains the only option to do that.
          // Basically we suppress the grafana multi org feature that way.
          for (const id of userOrgIds) {
            if (id !== orgId) {
              await this.grafana.removeFromOrg(user.id, id);
            }
          }
        }
        // Finally ensure right org is set.
        await this.grafana.switchUserOrg(user.id, orgId);
      }

      const content: CacheContent = { name: auth.name, tenantId: auth.tenantId };
      this.cache.set(auth.id, content);

      return auth.name;
    }

    return existing.name;
  }

  private async getHeaders(req: Request) {
    const username = await this.lock.acquire(req.auth.id, () => this.getOrCreateUser(req.auth));
    // https://grafana.com/docs/grafana/next/setup-grafana/configure-security/configure-authentication/auth-proxy/
    const headers: Record<string, string> = {
      'X-WEBAUTH-USER': username,
    };
    if (req.headers['host']) {
      headers['Host'] = req.headers['host'];
      headers['X-Forwarded-Host'] = req.headers['host'];
    }

    return headers;
  }

  private getProxy() {
    const proxy = httpProxy.createProxy({ target: this.config.grafana.url });
    proxy.on('proxyReq', (proxyReq, req, res, options) => {
      // Rewrite body to pass POST and PUT requests
      const body = (req as Request).body;
      if (body) {
        const bodyData = JSON.stringify(body);
        // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        // stream the content
        proxyReq.write(bodyData);
      }
    });

    proxy.on('error', (err, req, res) => {
      if (res instanceof ServerResponse) {
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
      }
      res.end();
    });

    return proxy;
  }
}
