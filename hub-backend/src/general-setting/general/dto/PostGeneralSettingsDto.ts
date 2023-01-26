import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class PostGeneralSettingsDto {
  @ApiProperty()
  key!: string;

  @ApiProperty()
  value!: string;
}

export const PutGeneralSettingsDtoSchema = Joi.array().items(
  Joi.object().keys({
    id: Joi.number(),
    key: Joi.string(),
    value: Joi.string().allow('', null),
  }),
);
