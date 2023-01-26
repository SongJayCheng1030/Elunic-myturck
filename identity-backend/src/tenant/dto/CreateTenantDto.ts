import { ApiProperty } from '@nestjs/swagger';
import Joi = require('joi');

export class CreateTenantClassDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  description?: string | null;

  @ApiProperty()
  enabled?: boolean;

  @ApiProperty()
  ownerId?: string;
}

export const CreateUpdateTenantDtoSchema = Joi.object({
  name: Joi.string().max(64).min(1).required(),
  description: Joi.alternatives(Joi.string().max(8192).default(null), null).optional(),
  enabled: Joi.boolean().default(true).optional(),
  ownerId: Joi.alternatives(Joi.string().uuid(), null).optional(),
}).unknown(false);
