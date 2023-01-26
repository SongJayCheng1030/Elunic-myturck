import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TenantDto, TenantSettingsDto } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';

import { EnvironmentService } from '.';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  tenants = new BehaviorSubject<TenantDto[]>([]);
  cache: TenantDto[] = [];

  filter: { [key: string]: string | boolean } = {};

  constructor(private http: HttpClient, private readonly environment: EnvironmentService) {
    this.getHttpTenants();
  }

  getTenants(): Observable<TenantDto[]> {
    return this.tenants;
  }

  async getHttpTenants() {
    const { data } = (await this.http
      .get<DataResponse<TenantDto[]>>(`${this.environment.tenantServiceUrl}tenants`)
      .toPromise()) as DataResponse<TenantDto[]>;
    this.cache = data;
    this.tenants.next(data);
  }

  async getTenantById(id: string): Promise<TenantDto | undefined> {
    const { data } = (await this.http
      .get<DataResponse<TenantDto>>(`${this.environment.tenantServiceUrl}tenants/${id}`)
      .toPromise()) as DataResponse<TenantDto>;
    return data;
  }

  async updateTenantById(id: string, dto: Partial<TenantDto>): Promise<TenantDto | undefined> {
    const { data } = (await this.http
      .patch<DataResponse<TenantDto>>(`${this.environment.tenantServiceUrl}tenants/${id}`, dto)
      .toPromise()) as DataResponse<TenantDto>;

    const currentTenants = this.tenants.getValue();
    this.tenants.next(
      currentTenants.map(item => {
        if (item.id === id) {
          return { ...item, ...data };
        }
        return item;
      }),
    );

    this.cache = this.tenants.getValue();
    return data;
  }

  async updateTenantSettingsByKey(
    tenantId: string,
    key: string,
    value: string,
  ): Promise<TenantSettingsDto | undefined> {
    const { data } = (await this.http
      .put<DataResponse<TenantSettingsDto>>(
        `${this.environment.tenantServiceUrl}tenant-settings/${tenantId}/${key}`,
        { value },
      )
      .toPromise()) as DataResponse<TenantSettingsDto>;
    return data;
  }

  async createTenant(dto: Partial<TenantDto>): Promise<TenantDto | undefined> {
    const { data } = (await this.http
      .post<DataResponse<TenantDto>>(`${this.environment.tenantServiceUrl}tenants`, {
        name: dto.name,
      })
      .toPromise()) as DataResponse<TenantDto>;
    this.tenants.next(this.tenants.getValue().concat([data]));
    this.cache = this.tenants.getValue();
    return data;
  }

  async deleteTenantById(id: string): Promise<boolean> {
    await this.http
      .delete<DataResponse<void>>(`${this.environment.tenantServiceUrl}tenants/${id}`)
      .toPromise();
    this.tenants.next(this.tenants.getValue().filter(item => item.id !== id));
    this.cache = this.tenants.getValue();
    // FIXME: remove and check that nothing else breaks
    return true;
  }

  filterBy(key: keyof TenantDto, value?: string | boolean) {
    if (typeof value === 'undefined') {
      // @ts-ignore
      delete this.filter[key];
      this.tenants.next([...this.cache]);
      return;
    }
    // @ts-ignore
    this.filter[key] = value;

    const filters = Object.keys(this.filter);
    let resultArray: TenantDto[] = [...this.cache];
    filters.forEach(filterKey => {
      const filterValue = this.filter[filterKey];
      if (typeof filterValue === 'boolean') {
        // tslint:disable-next-line:triple-equals
        resultArray = resultArray.filter(
          item => !!item[filterKey as keyof TenantDto] == filterValue,
        );
        return;
      }
      resultArray = resultArray.filter(item =>
        (item[filterKey as keyof TenantDto] as string).includes(filterValue),
      );
    });
    this.tenants.next(resultArray);
  }
}
