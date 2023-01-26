import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { lastValueFrom, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';

import { UserMeDto } from '../models';
import { Logger } from '../util/logger';
import { EnvironmentService } from '.';
import { MockUsersMeResponse } from './mock/mock-me-response';

export interface AuthInfo {
  id: string;
  tenantId: string;
  iat: number;
  name: string;
  exp?: number;
  scopes?: string[];
  userLang: string;
  isMultitenant: boolean;
  groups: string[];
  roles: string[];
}

export interface UserRights {
  [resourceKey: string]: {
    [rightKey: string]: boolean;
  };
}

export const VIEW_KEY = 'global-view';

export const WRITE_KEY = 'global-write';

export const APP_INSIGHTS_INSTRUMENTATION_KEY = 'appiInstrumentationKey';

@Injectable({
  providedIn: 'root',
})
export class SharedSessionService {
  private readonly logger: Logger = new Logger(`SharedSessionService`);

  private _me: UserMeDto | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly environment: EnvironmentService,
  ) {}

  async initializeService(): Promise<void> {
    this.printLocalDevBanner();

    // Load the current user
    try {
      await lastValueFrom(this.me$());
      this.logger.info(`Current user:`, this._me);
    } catch (ex) {
      this.logger.error(`Fatal Error:`);
      this.logger.error(`Cannot load current user:`, ex);
    }

    // Try to init app insights
    this.initializeAppInsights();
  }

  async getMe() {
    return await lastValueFrom(this.me$());
  }

  async getMyImageUrl(): Promise<string> {
    try {
      const user = await this.getMe();
      this.logger.debug(`getMyImageUrl: current user:`, user);
      if (user.imageId) {
        const profileUrl = urlJoin(
          this.environment.fileServiceUrl,
          'v1/image',
          `${user.imageId}?w=35&h=35&fit=cover`,
        );
        this.logger.debug(`profileImageUrl=`, profileUrl);
        return profileUrl;
      }
    } catch (ex) {
      this.logger.info(`Cannot load user image, using fallback ...`);
    }
    return this.getUserImageUrl();
  }

  get userRights(): string[] {
    if (!this._me) {
      this.logger.error(
        `Error: cannt get user's rights. Returning nothing. This might lead to problems!`,
      );
      return [];
    }

    return this._me.rights;
  }

  get userName(): string {
    if (!this._me) {
      return 'N/A';
    }

    return (
      [this._me ? this._me.firstName || '' : '', this._me ? this._me.lastName || '' : '']
        .join(' ')
        .trim() ||
      this._me.name ||
      'N/A'
    );
  }

  getUserImageUrl(): string {
    const abbr =
      this.userName
        .split(' ')
        .map(p => p.trim())
        .filter(p => !!p)
        .map(p => p.charAt(0).toUpperCase())
        .join('')
        .trim() || 'N/A';
    return (
      'data:image/svg+xml;base64,' +
      btoa(
        `<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg width="128" height="128" viewBox="0 0 33.866666 33.866668" version="1.1" id="svg5" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><defs id="defs2" /><g id="layer1"><circle style="fill:#eeeeef;fill-opacity:1;stroke-width:1.4397" id="path880" cx="17" cy="17" r="17" /><text xml:space="preserve" style="font-style:normal;font-weight:normal;font-size:16.9333px;line-height:1.25;font-family:sans-serif;text-align:center;text-anchor:middle;fill:#6a6a6a;fill-opacity:1;stroke:none;stroke-width:0.264583" x="16.941601" y="23.089018" id="text1292"><tspan id="tspan1290" style="font-size:16.9333px;text-align:center;text-anchor:middle;stroke-width:0.264583;fill:#6a6a6a;fill-opacity:1" x="16.941601" y="23.089018">${abbr}</tspan></text></g></svg>`,
      )
    );
  }

  get<T>(url: string, httpOptions: object = {}): Promise<HttpResponse<T> & { body: T }> {
    return this.withErrorHandling(
      this.http.get<T>(url, {
        ...httpOptions,
        observe: 'response',
      }),
      [200],
    );
  }

  post<T>(
    url: string,
    body: unknown | null = null,
    httpOptions: object = {},
  ): Promise<HttpResponse<T> & { body: T }> {
    return this.withErrorHandling(
      this.http.post<T>(url, body, {
        ...httpOptions,
        observe: 'response',
      }),
      [200, 201],
    );
  }

  put<T>(
    url: string,
    body: unknown | null = null,
    httpOptions: object = {},
  ): Promise<HttpResponse<T> & { body: T }> {
    return this.withErrorHandling(
      this.http.put<T>(url, body, {
        ...httpOptions,
        observe: 'response',
      }),
      [200],
    );
  }

  delete<T>(url: string, httpOptions: object = {}): Promise<HttpResponse<T> & { body: T }> {
    return this.withErrorHandling(
      this.http.delete<T>(url, {
        ...httpOptions,
        observe: 'response',
      }),
      [200],
    );
  }

  private withErrorHandling<T>(request: Observable<HttpResponse<T>>, allowedStatuses: number[]) {
    return lastValueFrom(request).then((response: HttpResponse<T> | undefined) => {
      return response as HttpResponse<T> & { body: T };
    });
  }

  me$(): Observable<UserMeDto> {
    // Check if alrady present
    if (this._me) {
      this.logger.debug(`Using cached /user/me object:`, this._me);
      return of(this._me);
    }

    // Fetch it
    return this.http
      .get<DataResponse<UserMeDto>>(urlJoin(this.environment.userServiceUrl, 'v1/users/user/me'))
      .pipe(
        catchError((err, _) => {
          // Check if local dev
          if (this.environment.isDevelopmentMode) {
            this.printLocalMockTokenNotice();
            return of(MockUsersMeResponse);
          } else {
            this.logger.error(`Failed to load user info:`, err);
          }

          return of(null);
        }),
        map(resp => {
          if (!resp) {
            throw new Error(`Could not receive any user info`);
          }
          // @ts-ignore
          this._me = resp.data;
          // @ts-ignore
          return resp.data;
        }),
      );
  }

  // ---

  private async initializeAppInsights() {
    const url = urlJoin(
      this.environment.hubServiceUrl,
      `/v1/static-settings/${APP_INSIGHTS_INSTRUMENTATION_KEY}?try=1`,
    );
    this.logger.debug(`initializeAppInsights`, url);

    await this.http
      .get<{ data: { [APP_INSIGHTS_INSTRUMENTATION_KEY]: string } }>(url)
      .subscribe(ret => {
        if (typeof ret.data[APP_INSIGHTS_INSTRUMENTATION_KEY] === 'string') {
          const key = ret.data[APP_INSIGHTS_INSTRUMENTATION_KEY];
          this.logger.debug(`Enabling AppInsights with key:`, key);

          const appInsights = new ApplicationInsights({
            config: {
              instrumentationKey: key,
            },
          });

          const appName = window.location.pathname.replace(/\//g, '');

          appInsights.loadAppInsights();
          appInsights.trackPageView({
            name: appName,
            isLoggedIn: true,
            uri: window.location.href,
            pageType: 'sioApp',
            properties: {
              tenantId: this._me ? this._me.tenantId : 'n/a',
              userId: this._me ? this._me.id : 'n/a',
              userName: this._me
                ? `${this._me.firstName || ''} ${this._me.lastName || ''}`.trim() || this._me.name
                : 'n/a',
            },
          });

          if (this._me) {
            appInsights.trackEvent({
              name: 'sioAppStartedEvent',
              properties: {
                appName,
                tenantId: this._me.tenantId,
                userId: this._me.id,
                userName:
                  `${this._me.firstName || ''} ${this._me.lastName || ''}`.trim() || this._me.name,
              },
            });

            // appInsights.trackMetric({
            //   name: "sioTenantId",
            //   iKey: this._me.tenantId
            // });
          }
        }
      });
  }

  private async printLocalDevBanner() {
    if (!this.environment.isDevelopmentMode) {
      return;
    }

    console.warn(
      '%cℹ️ Shopfloor.IO Development\n\n' +
        '%cWelcome to a wonderful Shopfloor.IO app! Some important notice:\n\n' +
        " - You are seeing this banner, because you're developing locally\n" +
        ' - If you see an red error messages, this is most likely caused by ' +
        'a service which is not yet started. But: most of those messages can ' +
        'be ignored for local development. For example tiles, configuration, etc. ' +
        'can be ignored and is replaced with mock data automagically for development.' +
        '\n\n' +
        'Happy coding!',
      'font-weight: bold; font-size:16px',
      'color:black; font-size:10px',
    );
  }

  private async printLocalMockTokenNotice() {
    console.warn(
      '%cℹ️ Development information\n' +
        "%cIt seems that you're currently developing on a local machine " +
        'and the identity service is not started or available, because ' +
        "the request to '.../v1/users/user/me' failed\n" +
        'A mock user has been automatically injected to keep you working!',
      'font-weight: bold; font-size:16px',
      'color:black; font-size:10px',
    );
  }
}
