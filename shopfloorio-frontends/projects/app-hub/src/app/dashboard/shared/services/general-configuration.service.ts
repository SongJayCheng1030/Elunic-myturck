import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SharedSessionService } from '@sio/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataResponse } from 'shared/common/response';

export interface GeneralConfiguration {
  key: string;
  value?: string | number | null;
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class GeneralConfigurationService {
  generalConfiguration = new BehaviorSubject<GeneralConfiguration[]>([]);

  constructor(private apiService: SharedSessionService) {
    this.getHttpGeneralConfiguration();
  }

  getGeneralConfiguration(): Observable<GeneralConfiguration[]> {
    return this.generalConfiguration;
  }

  setGeneralConfiguration(values: GeneralConfiguration[]) {
    this.generalConfiguration.next(values);
  }

  getEndpointUrl(endpoint: string): string {
    return new URL(`/service/hub/${endpoint}`, window.location.origin).href;
  }

  async getHttpGeneralConfiguration() {
    const configurations: HttpResponse<DataResponse<GeneralConfiguration[]> | null> =
      await this.apiService.get(this.getEndpointUrl('general'));
    if (!configurations.body) {
      return;
    }
    this.setGeneralConfiguration(configurations.body?.data);
  }

  async updateHttpGeneralConfiguration(value: Array<Partial<GeneralConfiguration>>) {
    const light = value.find(item => item.key === 'light');
    if (light) {
      light.value = light.value ? '1' : null;
    }

    const configuration: HttpResponse<DataResponse<GeneralConfiguration[]> | null> =
      await this.apiService.post(this.getEndpointUrl('general'), value);
    if (!configuration.body) {
      return;
    }
    this.setGeneralConfiguration(configuration.body?.data);
  }

  getProperty(key: string): GeneralConfiguration | undefined {
    const property = this.generalConfiguration.getValue().find(item => item.key === key);
    return property;
  }
}
