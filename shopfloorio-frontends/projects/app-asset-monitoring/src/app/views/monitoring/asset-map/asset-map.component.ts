import { Component, AfterViewInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import urlJoin from 'url-join';
import * as L from 'leaflet';

import {
  AssetService,
  EnvironmentService,
  MultilangDirective,
  SidebarService,
  TreeNode,
} from '@sio/common';
import { AssetDto, ISA95EquipmentHierarchyModelElement } from 'shared/common/models';

@Component({
  selector: 'app-asset-map',
  templateUrl: './asset-map.component.html',
  styleUrls: ['./asset-map.component.scss'],
})
export class AssetMapComponent implements AfterViewInit {
  @Input() treeNode!: TreeNode;

  constructor(
    private readonly translateService: TranslateService,
    private readonly assetService: AssetService,
    private readonly sidebarService: SidebarService,
    private readonly environment: EnvironmentService,
  ) {}

  async ngAfterViewInit() {
    L.Icon.Default.imagePath = 'assets/leaflet/';
    const map = L.map('map').setView([52.520008, 13.404954], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    if (this.treeNode?.children?.length) {
      const siteAssets: AssetDto[] = [];
      this.sidebarService.collectAssetEquipmentTypeNodes(
        this.treeNode,
        siteAssets,
        ISA95EquipmentHierarchyModelElement.SITE,
      );
      siteAssets?.forEach(siteAsset => {
        this.assetService.getAssetProperties(siteAsset.id).then(properties => {
          const latProp = properties?.find(property => property.key === 'lat');
          const lonProp = properties?.find(property => property.key === 'lon');
          try {
            if (latProp && lonProp) {
              const assetName = MultilangDirective.translate(siteAsset.name, this.translateService);
              const hrefLink = urlJoin(
                this.environment.assetsMonitoringFrontendUrl,
                `/#/overview/${siteAsset.id}`,
              );
              L.marker([Number(latProp.value), Number(lonProp.value)])
                .addTo(map)
                .bindPopup(`<a href="${hrefLink}" style="font-weight: bold;">${assetName}</a>`);
            }
          } catch (err) {
            console.error(err);
          }
        });
      });
    }
  }
}
