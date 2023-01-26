import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EnvironmentService, NotificationType, TimeLine, AssetService } from '@sio/common';
import { AssetDto, MultilangValue } from 'shared/common/models';

interface AssetAttribute {
  label?: string;
  name?: MultilangValue;
  value: any;
  color?: string;
  translate?: boolean;
}

interface Throughputs {
  title?: string;
  property?: any;
  unit?: string;
}

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss'],
})
export class AssetDetailsComponent implements OnInit {
  asset!: AssetDto;
  assetAttributes: AssetAttribute[] = [];
  firstHalf: AssetAttribute[] = [];
  secondHalf: AssetAttribute[] = [];
  throughputs: Throughputs[] = [];
  timelines: TimeLine[] = [];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly assetService: AssetService,
    private readonly environment: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.asset = this.activatedRoute.snapshot.data.asset;
    if (this.asset) {
      this.assetAttributes.push({
        label: 'VIEWS.ASSET_DETAILS.ASSET_NAME',
        value: this.asset.name,
        translate: true,
      });
      this.assetAttributes.push({
        label: 'VIEWS.ASSET_DETAILS.ASSET_TYPE',
        value: this.asset.assetType?.name,
        translate: true,
      });
      this.assetAttributes.push({
        label: 'VIEWS.ASSET_DETAILS.LIVE_STATUS',
        value: 'Producing',
        color: '#31d697',
      });
      this.assetAttributes.push({
        label: 'VIEWS.ASSET_DETAILS.ISA95_TYPE',
        value: this.asset.assetType?.equipmentType,
      });
      this.assetAttributes.push({
        label: 'VIEWS.ASSET_DETAILS.PARENT_ASSET',
        value: this.asset.name,
        translate: true,
      });
      this.assetAttributes.push({
        label: 'VIEWS.ASSET_DETAILS.DESCRIPTION',
        value: this.asset.description,
      });
      this.assetService
        .getAssetProperties(this.asset.id)
        .then(properties => {
          properties?.forEach(property => {
            if (!property.isHidden) {
              this.assetAttributes.splice(this.assetAttributes.length - 1, 0, {
                name: property.name,
                value: property.value,
                translate: true,
              });
            }
          });
        })
        .finally(() => {
          if (this.assetAttributes.length > 6) {
            const half = Math.ceil(this.assetAttributes.length / 2);
            this.firstHalf = this.assetAttributes.slice(0, half);
            this.secondHalf = this.assetAttributes.slice(half);
          } else {
            this.firstHalf = this.assetAttributes;
          }
        });
      this.throughputs = [
        {
          title: 'THROUGHPUTS.ERRORS',
          property: {
            current: 24,
            trend: 0,
            trendDirection: 0,
          },
          unit: 'UNITS.ERRORS_TOTAL',
        },
        {
          title: 'THROUGHPUTS.MTBF',
          property: {
            current: 123,
            trend: -3,
            trendDirection: -1,
          },
          unit: 'UNITS.MINUTES',
        },
        {
          title: 'THROUGHPUTS.MTTR',
          property: {
            current: 123,
            trend: -3,
            trendDirection: -1,
          },
          unit: 'UNITS.MINUTES',
        },
        {
          title: 'THROUGHPUTS.PRODUCED_TOTAL',
          property: {
            current: 8.537,
            trend: 10,
            trendDirection: 1,
          },
          unit: 'UNITS.PIECES',
        },
        {
          title: 'THROUGHPUTS.CYCLE_RATE',
          property: {
            current: 24,
            trend: 0,
            trendDirection: 0,
          },
          unit: 'UNITS.PER_MINUTE',
        },
      ];
      this.timelines = [
        {
          notificationType: NotificationType.ERROR,
          description: 'Machine #1 encountered an unknown error.',
          color: '#fd5064',
          createdAt: '2022-02-21T06:47:21.000Z',
        },
        {
          notificationType: NotificationType.NOTIFICATION,
          description: 'Lorem ipsum dolor met Lorem ipsum dolor met…',
          color: '#0090d4',
          createdAt: '2022-02-21T06:27:15.000Z',
        },
        {
          notificationType: NotificationType.ERROR,
          description: 'Machine #1 encountered an unknown error.',
          color: '#fd5064',
          createdAt: '2022-02-21T03:12:33.000Z',
        },
      ];
    }
  }

  imageIdToUrl(imageId: string) {
    if (!imageId) {
      return '';
    }
    return `${this.environment.fileServiceUrl}v1/image/${imageId}`;
  }
}
