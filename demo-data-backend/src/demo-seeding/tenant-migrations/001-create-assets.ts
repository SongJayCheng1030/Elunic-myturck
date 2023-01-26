import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Injectable } from '@nestjs/common';
import { ISA95EquipmentHierarchyModelElement } from 'shared/common/models';
import { AuthInfo } from 'shared/common/types';
import { SharedAssetService, SharedFileService, TenantMigration } from 'shared/nestjs';

import { CertussLogoImage } from './certuss-logo-image';
import { ElektroBoilerImage } from './elektro-boiler-image';
import { GasBoilerImage } from './gas-boiler-image';

@Injectable()
export class TenantMigrationCreateAssets001 implements TenantMigration {
  constructor(
    private readonly fileService: SharedFileService,
    private readonly assetService: SharedAssetService,
    @InjectLogger('TenantMigrationCreateAssets001')
    private logger: Logger,
  ) {}

  async getName(): Promise<string> {
    return '001-CreateDemoAssets';
  }

  async up(tenantId: string, authInfo: AuthInfo): Promise<void> {
    try {
      let certussImageId = null;
      let elektroImageId = null;
      let gasImageId = null;
      let assetLocationTypeId = '';
      let assetMachineTypeId = '';

      const responseFiles = await Promise.allSettled([
        this.fileService.uploadFileByBuffer(
          authInfo,
          Buffer.from(CertussLogoImage, 'base64'),
          'cretuss.png',
          'image/png',
        ),

        this.fileService.uploadFileByBuffer(
          authInfo,
          Buffer.from(ElektroBoilerImage, 'base64'),
          'elektro.png',
          'image/png',
        ),

        this.fileService.uploadFileByBuffer(
          authInfo,
          Buffer.from(GasBoilerImage, 'base64'),
          'gas.png',
          'image/png',
        ),
      ]);
      if (responseFiles.length > 0) {
        certussImageId = responseFiles[0].status === 'fulfilled' ? responseFiles[0].value.id : null;
        elektroImageId = responseFiles[1].status === 'fulfilled' ? responseFiles[1].value.id : null;
        gasImageId = responseFiles[2].status === 'fulfilled' ? responseFiles[2].value.id : null;
      }

      const assetLocationType = await this.assetService.createAssetType(authInfo, {
        name: {
          en_EN: 'Location',
        },
        description: 'description',
        equipmentType: ISA95EquipmentHierarchyModelElement.SITE,
      });

      if (assetLocationType) {
        assetLocationTypeId = assetLocationType.id;
        const assetMachineType = await this.assetService.createAssetType(authInfo, {
          name: {
            en_EN: 'Machine',
          },
          description: 'description',
          equipmentType: ISA95EquipmentHierarchyModelElement.PRODUCTION_UNIT,
          extendsType: assetLocationType.id,
        });

        if (assetMachineType) assetMachineTypeId = assetMachineType.id;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseAssets: any = await Promise.allSettled([
        this.assetService.rawPost(authInfo, 'v1/assets', {
          imageId: certussImageId,
          name: { en_EN: 'Krefeld' },
          assetType: assetLocationTypeId,
          description: null,
          aliases: [],
          documents: [],
        }),

        this.assetService.rawPost(authInfo, 'v1/assets', {
          imageId: elektroImageId,
          name: { en_EN: 'Elektrokessel' },
          assetType: assetMachineTypeId,
          description: null,
          aliases: [],
          documents: [],
        }),

        this.assetService.rawPost(authInfo, 'v1/assets', {
          imageId: gasImageId,
          name: { en_EN: 'Gaskessel' },
          assetType: assetMachineTypeId,
          description: null,
          aliases: [],
          documents: [],
        }),
      ]);

      if (responseAssets.length) {
        if (responseAssets[0].status === 'fulfilled') {
          await this.assetService.transform(authInfo, {
            id: responseAssets[0].value.data.id as string,
            type: 'childOf',
          });
        }
        if (responseAssets[1].status === 'fulfilled') {
          await this.assetService.transform(authInfo, {
            id: responseAssets[1].value.data.id as string,
            type: 'childOf',
            childOf: responseAssets[0].value.data.id as string,
          });
        }
        if (responseAssets[2].status === 'fulfilled') {
          await this.assetService.transform(authInfo, {
            id: responseAssets[2].value.data.id as string,
            type: 'childOf',
            childOf: responseAssets[0].value.data.id as string,
          });
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
