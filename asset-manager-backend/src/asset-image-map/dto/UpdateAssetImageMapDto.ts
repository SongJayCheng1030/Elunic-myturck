import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

import { AssetMapItemClassDto } from './AssetImageMapItemDto';

export interface UpdateImageMapDto {
  id: string;
  backgroundImageId: string;
}

export const SetParentMapSchema = Joi.object({
  assetId: Joi.string().max(16384),
  imageMapId: Joi.alternatives(null, Joi.string().max(16384)),
});

export class SetParentAssetImageMapClassDto {
  @ApiProperty()
  imageMapId!: string;

  @ApiProperty()
  assetId!: string;
}

export const UpdateImageMapSchema = Joi.object({
  id: Joi.string().max(16384),
  backgroundImageId: Joi.string().max(16384),
  mapItems: Joi.array().items(
    Joi.object().keys({
      assetId: Joi.string(),
      imageId: Joi.alternatives(null, Joi.string().uuid()),
      left: Joi.number(),
      top: Joi.number(),
    }),
  ),
});

export class UpdateImageMapClassDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  backgroundImageId!: string;

  @ApiProperty()
  mapItems?: AssetMapItemClassDto[];
}
