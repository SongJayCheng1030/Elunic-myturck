import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { AssetService } from '@sio/common';
import { AssetTypeDto } from 'shared/common/models';

@Injectable({ providedIn: 'root' })
export class AssetTypeDetailsResolver implements Resolve<AssetTypeDto | null> {
  constructor(private router: Router, private assetService: AssetService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<AssetTypeDto | null> {
    const id = route.paramMap.get('id') as string;
    const assetType = await this.assetService.getAssetType(id);

    if (!assetType) {
      await this.router.navigate(['/']);
      return null;
    }
    return assetType;
  }
}
