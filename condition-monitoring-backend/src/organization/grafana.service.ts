import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Connection } from 'typeorm';

import { ConfigService } from '../config/config.service';
import { MysqlGrafanaDataSource } from '../device/mysql.service';
import { GrafanaOrg } from './organization.dto';
import urlJoin = require('url-join');

export interface GrafanaDashboardSearchResult {
  id: number;
  uid: string;
  title: string;
  uri: string;
  url: string;
  slug: string;
  type: 'dash-folder' | 'dash-db';
  tags: string[];
  isStarred: boolean;
  sortMeta: number;
}

export interface GrafanaDashboardDetailResult {
  meta: {
    slug: string;
    url: string;
  };
  dashboard: {
    uid: string;
    title: string;
    panels: Array<{
      id: string;
      title: string;
      type: string; // e.g. "graph", ...
    }>;
    tags: string[];
  };
  tagsParsed: {
    [key: string]: string;
  };
}

export interface GrafanaDataSource {
  id: string;
  name: string;
  type: string;
  jsonData: any;
}

export interface CreateGrafanaDatasourceResponse {
  datasource: {
    id: number;
    uid: string;
    orgId: number;
    name: string;
  };
}

@Injectable()
export class GrafanaService {
  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
    @InjectConnection('data_lake') private readonly connection: Connection,
  ) {}

  async getOrg(id: string): Promise<GrafanaOrg> {
    const res = await this.http
      .get<GrafanaOrg>(urlJoin(this.config.grafana.url, `/api/orgs/${id}`), this.getReqConfig())
      .toPromise();

    return res.data;
  }

  async getOrgs(): Promise<GrafanaOrg[]> {
    const res = await this.http
      .get<GrafanaOrg[]>(urlJoin(this.config.grafana.url, `/api/orgs`), this.getReqConfig())
      .toPromise();

    return res.data;
  }

  async createDashboard(orgId: string, config: any): Promise<any> {
    const res = await this.http
      .post<any>(
        urlJoin(this.config.grafana.url, `/api/dashboards/import`),
        config,
        this.getReqConfig(orgId),
      )
      .pipe(
        catchError(error => {
          console.log('error', error);
          return throwError(() => 'error');
        }),
      )
      .toPromise();

    return res.data;
  }

  async createOrg(name: string): Promise<GrafanaOrg> {
    const res = await this.http
      .post<GrafanaOrg & { orgId: number }>(
        urlJoin(this.config.grafana.url, '/api/orgs'),
        { name },
        this.getReqConfig(),
      )
      .toPromise();

    return { ...res.data, id: String(res.data.orgId) };
  }

  async updateOrg(id: string, name: string): Promise<GrafanaOrg> {
    const res = await this.http
      .post<GrafanaOrg>(
        urlJoin(this.config.grafana.url, `/api/orgs/${id}`),
        { name },
        this.getReqConfig(),
      )
      .toPromise();

    return res.data;
  }

  async deleteOrg(id: string): Promise<void> {
    await this.http
      .delete<GrafanaOrg>(urlJoin(this.config.grafana.url, `/api/orgs/${id}`), this.getReqConfig())
      .toPromise();
  }

  async getUser(username: string): Promise<{ name: string; orgId: number; id: string }> {
    const { data } = await this.http
      .get<{ name: string; orgId: number; id: string }>(
        urlJoin(this.config.grafana.url, `/api/users/lookup?loginOrEmail=${username}`),
        this.getReqConfig(),
      )
      .toPromise();
    return data;
  }

  async createUser(dto: {
    username: string;
    email?: string;
    orgId: number;
    role: 'Admin' | 'Editor' | 'Viewer';
  }): Promise<{ name: string }> {
    const reqConfig = this.getReqConfig(String(dto.orgId));

    const { data } = await this.http
      .post<{ id: number }>(
        urlJoin(this.config.grafana.url, `/api/admin/users`),
        {
          name: dto.username,
          login: dto.username,
          email: dto.email,
          password: randomBytes(16).toString('hex'),
          OrgId: dto.orgId,
        },
        reqConfig,
      )
      .toPromise();

    await this.http
      .patch<{ id: number }>(
        urlJoin(this.config.grafana.url, `/api/org/users/${data.id}`),
        {
          role: dto.role,
        },
        reqConfig,
      )
      .toPromise();

    return this.getUser(dto.username);
  }

  async addToOrg(dto: { username: string; role: 'Admin' | 'Editor' | 'Viewer' }, orgId: number) {
    await this.http
      .post<{ id: number }>(
        urlJoin(this.config.grafana.url, `/api/orgs/${orgId}/users`),
        {
          loginOrEmail: dto.username,
          role: dto.role,
        },
        this.getReqConfig(String(orgId)),
      )
      .toPromise();
  }

  async removeFromOrg(id: string, orgId: number) {
    await this.http
      .delete<{ id: number }>(
        urlJoin(this.config.grafana.url, `/api/orgs/${orgId}/users/${id}`),
        this.getReqConfig(String(orgId)),
      )
      .toPromise();
  }

  async switchUserOrg(id: string, orgId: number) {
    await this.http
      .post<{ id: number }>(
        urlJoin(this.config.grafana.url, `/api/users/${id}/using/${orgId}`),
        {},
        this.getReqConfig(),
      )
      .toPromise();
  }

  async getUserOrgs(id: string) {
    return this.http
      .get<Array<{ orgId: number }>>(
        urlJoin(this.config.grafana.url, `/api/users/${id}/orgs`),
        this.getReqConfig(),
      )
      .toPromise()
      .then(res => res.data.map(d => d.orgId));
  }

  async assignRole(id: string, orgId: number, role: 'Admin' | 'Editor' | 'Viewer') {
    await this.http
      .patch<{ id: number }>(
        urlJoin(this.config.grafana.url, `/api/org/users/${id}`),
        {
          role,
        },
        this.getReqConfig(String(orgId)),
      )
      .toPromise()
      .catch(err => {
        console.log(err);
      });
  }

  async createAdmin(username: string, email?: string) {
    const { data } = await this.http
      .post<{ id: number }>(
        urlJoin(this.config.grafana.url, `/api/admin/users`),
        {
          name: username,
          login: username,
          email,
          password: randomBytes(16).toString('hex'),
        },
        this.getReqConfig(),
      )
      .toPromise();

    await this.http
      .put<{ id: number }>(
        urlJoin(this.config.grafana.url, `/api/admin/users/${data.id}/permissions`),
        {
          isGrafanaAdmin: true,
        },
        this.getReqConfig(),
      )
      .toPromise();

    return this.getUser(username);
  }

  async getDataSource(orgId: string, sourceId: string): Promise<GrafanaDataSource> {
    const res = await this.http
      .get<GrafanaDataSource>(
        urlJoin(this.config.grafana.url, `/api/datasources/${sourceId}`),
        this.getReqConfig(orgId),
      )
      .toPromise();

    return res.data;
  }

  async getDataSources(orgId: string): Promise<GrafanaDataSource[]> {
    const res = await this.http
      .get<GrafanaDataSource[]>(
        urlJoin(this.config.grafana.url, `/api/datasources`),
        this.getReqConfig(orgId),
      )
      .toPromise();

    return res.data;
  }

  async getGrafanaConfig(orgId: string): Promise<MysqlGrafanaDataSource> {
    // TODO: Find a better way to create a user name.
    const user = `gfds_${orgId}`;
    const password = randomBytes(12).toString('hex');
    await this.connection
      .createEntityManager()
      .query(
        `CREATE USER IF NOT EXISTS ${this.connection.driver.escape(
          user,
        )} IDENTIFIED BY '${password}';`,
      );

    const hostSegments = this.config.datalake.host.split('.');
    return {
      name: `MySQL`,
      type: 'mysql',
      access: 'proxy',
      url: `${this.config.datalake.host}:${this.config.database.port}`,
      user: hostSegments.length > 1 ? `${user}@${hostSegments[0]}` : user,
      database: this.config.datalake.name,
      jsonData: {},
      version: 1,
      secureJsonData: { password },
      readOnly: true,
      isDefault: false,
    };
  }

  async createDataSource(orgId: string, config: any): Promise<string> {
    const res = await this.http
      .post<CreateGrafanaDatasourceResponse>(
        urlJoin(this.config.grafana.url, '/api/datasources'),
        config,
        this.getReqConfig(orgId),
      )
      .toPromise();
    return res.data.datasource.uid;
  }

  async updateDataSource(orgId: string, sourceId: string, config: any): Promise<string> {
    const res = await this.http
      .put<GrafanaDataSource>(
        urlJoin(this.config.grafana.url, `/api/datasources/${sourceId}`),
        config,
        this.getReqConfig(orgId),
      )
      .toPromise();

    return res.data.id;
  }

  parseGfDashboardTags(tags: string[] | null | undefined): { [key: string]: string } {
    const tagsObj: { [key: string]: string } = {};

    if (Array.isArray(tags)) {
      for (const rawTag of tags) {
        const t = `${rawTag || ''}`;
        const idx = t.indexOf('=');
        if (idx > -1) {
          tagsObj[t.substring(0, idx)] = t.substring(idx + 1);
        } else {
          tagsObj[t] = '';
        }
      }
    }

    return tagsObj;
  }

  async getDashboardByUid(orgId: string, uid: string): Promise<GrafanaDashboardDetailResult> {
    try {
      const { data } = await this.http
        .get<GrafanaDashboardDetailResult>(
          urlJoin(this.config.grafana.url, `/api/dashboards/uid/${uid}`),
          this.getReqConfig(orgId),
        )
        .toPromise();

      return { ...data, tagsParsed: this.parseGfDashboardTags(data.dashboard.tags) };
    } catch {
      throw new NotFoundException(`No such dashboard`);
    }
  }

  async getDashboards(orgId: string, query?: string): Promise<GrafanaDashboardSearchResult[]> {
    let results: GrafanaDashboardSearchResult[] = [];

    // Fetch the paginated data
    let page = 1;
    let hasResults = false;
    do {
      const { data } = await this.http
        .get<GrafanaDashboardSearchResult[]>(urlJoin(this.config.grafana.url, '/api/search'), {
          ...this.getReqConfig(orgId),
          params: {
            query: query && typeof query === 'string' && query.length > 0 ? query : '',
            limit: 5000,
            page,
            type: 'dash-db',
          },
        })
        .toPromise();

      if (Array.isArray(data) && data.length > 0) {
        results = results.concat(data);
        hasResults = data.length > 0;
      } else {
        hasResults = false;
      }

      page++;
    } while (hasResults);

    return results;
  }

  private getReqConfig(orgId?: string) {
    return {
      auth: { username: this.config.grafana.user, password: this.config.grafana.pass },
      headers: orgId ? { 'X-Grafana-Org-Id': orgId } : undefined,
    };
  }
}

export interface InfluxDbDataSourceDto {
  name: string;
  url: string;
  orgId: string;
  token: string;
}
