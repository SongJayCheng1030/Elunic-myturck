import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class PostTileConfigurationDto {
  @ApiProperty()
  tileName!: string;

  @ApiProperty()
  desc!: string;

  @ApiProperty()
  appUrl!: string;

  @ApiProperty()
  iconUrl!: string;

  @ApiProperty()
  tileColor!: string;

  @ApiProperty()
  tileTextColor!: string;

  @ApiProperty()
  order!: number;

  @ApiProperty()
  show!: number;

  @ApiProperty()
  integratedView!: boolean;
}

export const PostTileConfigurationDtoSchema = Joi.object().keys({
  tileName: Joi.string().allow('', null),
  desc: Joi.string().allow('', null),
  appUrl: Joi.string().allow('', null),
  iconUrl: Joi.string().allow('', null),
  tileColor: Joi.string().allow('', null),
  tileTextColor: Joi.string().allow('', null),
  order: Joi.number(),
  show: Joi.number().allow(0, 1).only(),
  integratedView: Joi.boolean().allow(null),
});
