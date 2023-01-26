import { ApiProperty } from '@nestjs/swagger';
import { MultilangValue } from 'shared/common/models';

import {
  AssetPropertyDefinitionEntity,
  AssetPropertyValue,
} from '../asset-property-definition.entity';

export enum UnitedPropertyMode {
  NO_OVERLAY,
  OVERLAY,
}

/**
 * Data object to represent overlayed and non-overlayed properties,
 * containing the business-logic to perform the overlay as specified
 * by the functional definition. It is written in a way, that the
 * constructor accepts the entity data object from TypeORM and it
 * then creates the external representation by the internal business
 * logic. If specified, the overlay of values & properties is also
 * applied. Furthermore the on-the-fly calculated meta information
 * (`meta`) is generated, to use by the API consumer to get info if
 * the properties have been overwritten
 */
export class UnitedPropertyDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  key: string;
  @ApiProperty()
  name: MultilangValue;
  @ApiProperty()
  type: string;
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  value!: AssetPropertyValue | null;

  /**
   * If the value is a string value and contains variable replacements,
   * this contains the value with all replacements applied or as a
   * fallback the value of the field `value`
   */
  @ApiProperty()
  renderedValue!: AssetPropertyValue | null;

  @ApiProperty()
  position!: number | null;
  @ApiProperty()
  isHidden!: boolean | null;
  @ApiProperty()
  isRequired!: boolean | null;

  @ApiProperty()
  meta: {
    isOverwritten: boolean;
    fieldsOverwritten: string[];
    isForeignAssetType: boolean;
    originAssetType: string;
  };

  constructor(
    prop: AssetPropertyDefinitionEntity,
    assetTypeIdOrigin: string,
    mode: UnitedPropertyMode = UnitedPropertyMode.NO_OVERLAY,
  ) {
    if (!prop || !Array.isArray(prop.values) || prop.values.length < 1) {
      throw new Error(`Property definition has no values associated`);
    }

    this.name = prop.name;
    this.key = prop.key;
    this.type = prop.type.toUpperCase();
    this.createdAt = prop.createdAt.toISOString();
    this.updatedAt = prop.updatedAt.toISOString();

    this.meta = {
      isOverwritten: false,
      fieldsOverwritten: [],
      isForeignAssetType: assetTypeIdOrigin !== prop.assetTypeId,
      originAssetType: prop.assetTypeId,
    };

    // If the values array is populated, it most probably has two
    // value entries:
    //  1. one for the value of the definition entry
    //  2. one for the value of the possible asset overwrite
    // If provided, this array needs to be sorted, so that the
    // definition value comes always first so that the following
    // overwrite loop works correctly
    if (Array.isArray(prop.values)) {
      prop.values.sort((a, b) => {
        const scoreA = !a.asset || a.asset === null ? 100 : 0;
        const scoreB = !b.asset || b.asset === null ? 100 : 0;
        return scoreB - scoreA;
      });
    }

    // Overlay the values
    for (const val of prop.values) {
      this.id = val.id;

      this.meta.isOverwritten = !!val.asset;

      if (val.value !== null) {
        this.value = val.value;
        if (this.meta.isOverwritten) {
          this.meta.fieldsOverwritten.push('value');
        }
      }

      if (val.position !== null) {
        this.position = val.position;
        if (this.meta.isOverwritten) {
          this.meta.fieldsOverwritten.push('position');
        }
      }

      if (val.isHidden !== null) {
        this.isHidden = !!val.isHidden;
        if (this.meta.isOverwritten) {
          this.meta.fieldsOverwritten.push('isHidden');
        }
      }

      if (val.isRequired !== null) {
        this.isRequired = !!val.isRequired;
        if (this.meta.isOverwritten) {
          this.meta.fieldsOverwritten.push('isRequired');
        }
      }

      if (mode === UnitedPropertyMode.NO_OVERLAY) {
        break;
      }
    }
  }
}
