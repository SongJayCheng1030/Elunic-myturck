import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { SharedAssetService } from '@sio/common';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MonitoringResolver implements Resolve<any> {
  constructor(private readonly assetService: SharedAssetService) {}

  async resolve(): Promise<any> {
    return await lastValueFrom(this.assetService.assetTree$);
  }
}
