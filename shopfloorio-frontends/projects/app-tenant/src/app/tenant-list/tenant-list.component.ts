import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EnvironmentService, Logger, TenantService } from '@sio/common';
import { debounceTime } from 'rxjs/operators';
import { TenantDto } from 'shared/common/models';
import urljoin from 'url-join';

@Component({
  selector: 'app-tenant-list',
  templateUrl: './tenant-list.component.html',
  styleUrls: ['./tenant-list.component.scss'],
})
export class TenantListComponent implements OnInit {
  private logger = new Logger(`TenantListComponent`);

  tenants: TenantDto[] = [];
  search: FormControl = new FormControl(null);

  constructor(
    private tenantService: TenantService,
    private http: HttpClient,
    private readonly environment: EnvironmentService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.tenantService.getTenants().subscribe(value => (this.tenants = value));
    this.search.valueChanges.pipe(debounceTime(250)).subscribe(value => this.filterByName(value));
  }

  async deleteTenantById(id: string) {
    await this.tenantService.deleteTenantById(id);
    await this.tenantService.getHttpTenants();
  }

  filterByName(name: string) {
    this.tenantService.filterBy('name', name);
  }

  filterByStatus(status: string) {
    this.tenantService.filterBy('status', status);
  }

  async switchTo(tenantId: string) {
    this.logger.info(`switchTo(${tenantId}): started`);

    // TODO: FIXME: place in reusable service
    this.http
      .post<{ data: { redirectUrl: string; tenantId: string } }>(
        urljoin(this.environment.userServiceUrl, `/v1/users/auth/tenant/${tenantId}`),
        {},
      )
      .subscribe(resp => {
        // TODO: FIXME: add user alert on fail
        this.logger.info(`switchTo(${tenantId}): resp=`, resp);

        // Go to the redirect URL
        window.location.href = resp.data.redirectUrl;
      });
  }
}
