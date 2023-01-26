import { ApiProperty } from '@nestjs/swagger';
import Joi = require('joi');

export class UpdateTenantClassDto {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  enabled?: boolean;

  @ApiProperty()
  ownerId?: string;
}

export const UpdateTenantDtoSchema = Joi.object({
  name: Joi.string().max(64).min(1).optional(),
  description: Joi.alternatives(Joi.string().max(8192), null).optional(),
  enabled: Joi.boolean().optional(),
  ownerId: Joi.string().uuid().optional(),
}).unknown(false);
