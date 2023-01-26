import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

import { AssetMapItemClassDto } from './AssetImageMapItemDto';

export const CreateImageMapSchema = Joi.object({
  backgroundImageId: Joi.string().max(16384).optional(),
  mapItems: Joi.array().items(
    Joi.object().keys({
      assetId: Joi.string(),
      imageId: Joi.alternatives(null, Joi.string().uuid()),
      left: Joi.number(),
      top: Joi.number(),
    }),
  ),
});

export class CreateImageMapClassDto {
  @ApiProperty()
  backgroundImageId?: string;

  @ApiProperty()
  mapItems?: AssetMapItemClassDto[];
}
