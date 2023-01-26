import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GeneralConfiguration } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import urljoin from 'url-join';

import { EnvironmentService } from '.';

@Injectable({
  providedIn: 'root',
})
export class GeneralConfigurationService {
  generalConfiguration = new BehaviorSubject<GeneralConfiguration[]>([]);

  constructor(private http: HttpClient, private readonly environment: EnvironmentService) {
    this.getHttpGeneralConfiguration();
  }

  getGeneralConfiguration(): Observable<GeneralConfiguration[]> {
    return this.generalConfiguration;
  }

  setGeneralConfiguration(values: GeneralConfiguration[]) {
    this.generalConfiguration.next(values);
  }

  async getHttpGeneralConfiguration() {
    const { data } = (await this.http
      .get<DataResponse<GeneralConfiguration[]>>(urljoin(this.environment.hubServiceUrl, 'general'))
      .toPromise()) as DataResponse<GeneralConfiguration[]>;
    this.setGeneralConfiguration(data);
  }

  async updateHttpGeneralConfiguration(value: Array<Partial<GeneralConfiguration>>) {
    const light = value.find(item => item.key === 'light');
    if (light) {
      light.value = light.value ? '1' : null;
    }

    const { data } = (await this.http
      .post<DataResponse<GeneralConfiguration[]>>(
        urljoin(this.environment.hubServiceUrl, 'general'),
        value,
      )
      .toPromise()) as DataResponse<GeneralConfiguration[]>;
    this.setGeneralConfiguration(data);
  }

  getProperty(key: string): GeneralConfiguration | undefined {
    const property = this.generalConfiguration.getValue().find(item => item.key === key);
    return property;
  }
}
