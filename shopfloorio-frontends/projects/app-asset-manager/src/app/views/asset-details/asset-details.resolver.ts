import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { AssetService } from '@sio/common';
import { AssetDto } from 'shared/common/models';

@Injectable({ providedIn: 'root' })
export class AssetDetailsResolver implements Resolve<AssetDto | null> {
  constructor(private router: Router, private assetService: AssetService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<AssetDto | null> {
    const id = route.paramMap.get('id') as string;
    const asset = await this.assetService.getAsset(id);

    if (!asset) {
      await this.router.navigate(['/']);
      return null;
    }
    return asset;
  }
}
