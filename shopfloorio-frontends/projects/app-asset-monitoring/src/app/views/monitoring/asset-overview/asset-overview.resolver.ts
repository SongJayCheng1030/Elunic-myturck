import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { AssetService } from '@sio/common';
import { AssetDto } from 'shared/common/models';

@Injectable({ providedIn: 'root' })
export class AssetOverviewResolver implements Resolve<AssetDto | null> {
  constructor(private readonly assetService: AssetService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<AssetDto | null> {
    const id = route.paramMap.get('id') as string;
    return await this.assetService.getAsset(id);
  }
}
