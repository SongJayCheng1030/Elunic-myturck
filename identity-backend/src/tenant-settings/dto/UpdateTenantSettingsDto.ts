import { ApiProperty } from '@nestjs/swagger';
import Joi = require('joi');

export class UpdateTenantSettingsClassDto {
  @ApiProperty()
  value?: string;
}

export const UpdateTenantSettingsDtoSchema = Joi.object({
  value: Joi.string().max(200).required(),
}).unknown(false);
