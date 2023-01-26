import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { AssetService } from '@sio/common';
import { AssetImageMapDto } from 'shared/common/models';

@Injectable({ providedIn: 'root' })
export class AssetImageMapDetailsResolver implements Resolve<AssetImageMapDto | null> {
  constructor(private router: Router, private assetService: AssetService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<AssetImageMapDto | null> {
    const id = route.paramMap.get('id') as string;
    const assetImageMap = await this.assetService.getAssetImageMap(id);

    if (!assetImageMap) {
      await this.router.navigate(['/']);
      return null;
    }
    return assetImageMap;
  }
}
