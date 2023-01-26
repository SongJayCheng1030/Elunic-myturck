import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { DevicesService } from '@sio/common';

@Injectable({ providedIn: 'root' })
export class DeviceDetailsResolver implements Resolve<string | null> {
  constructor(private router: Router, private deviceService: DevicesService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<string | null> {
    const id = route.paramMap.get('id') as string;

    if (!id) {
      await this.router.navigate(['/']);
      return null;
    }
    return id;
  }
}
