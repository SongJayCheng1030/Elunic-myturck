import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  currentAppUrl!: string;

  get userServiceUrl(): string {
    return new URL('/service/identity/', window.location.origin).href;
  }

  get hubServiceUrl(): string {
    return new URL('/service/hub/', window.location.origin).href;
  }

  get tenantServiceUrl(): string {
    return new URL('/service/identity/v1/', window.location.origin).href;
  }

  get assetsManagerFrontendUrl(): string {
    return new URL('/asset-manager/', window.location.origin).href;
  }

  get tenantsFrontendUrl(): string {
    return new URL('/tenant/', window.location.origin).href;
  }

  get usersFrontendUrl(): string {
    return new URL('/user/', window.location.origin).href;
  }

  get hubFrontendUrl(): string {
    return new URL('/hub/', window.location.origin).href;
  }

  get fileServiceUrl(): string {
    return new URL('/service/file/', window.location.origin).href;
  }

  get assetServiceUrl(): string {
    return new URL('/service/asset/', window.location.origin).href;
  }

  get maintenanceServiceUrl(): string {
    return new URL('/service/maintenance', window.location.origin).href;
  }

  get conditionMonitoringServiceUrl(): string {
    return new URL('/service/condition-monitoring/', window.location.origin).href;
  }

  get assetsMonitoringFrontendUrl(): string {
    return new URL('/assets/', window.location.origin).href;
  }

  get isDevelopmentMode(): boolean {
    const env = window['environment'] as { production: boolean };
    if (!env) {
      !window['envAlerted'] &&
        console.warn(`Maybe you're missing to set the enviornment inside main.ts? 🤔`);
      window['envAlerted'] = true;
      return false;
    }
    return (
      !env.production ||
      ['1', 'true', 'on'].includes((localStorage.getItem('development') || '').toLowerCase())
    );
  }
}

export const environment = new EnvironmentService();
