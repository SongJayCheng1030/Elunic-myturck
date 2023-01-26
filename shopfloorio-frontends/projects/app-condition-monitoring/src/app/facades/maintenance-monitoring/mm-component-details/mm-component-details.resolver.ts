import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { MaintenanceMonitoringService } from '@sio/common';

@Injectable({ providedIn: 'root' })
export class MmComponentDetailsResolver implements Resolve<any> {
  constructor(private router: Router, private mmApiService: MaintenanceMonitoringService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<any> {
    const id = route.paramMap.get('componentId') as string;
    const component = await this.mmApiService.getComponent(id).toPromise();

    if (!component) {
      await this.router.navigate(['/maintenance-monitoring']);
      return null;
    }
    return component;
  }
}
