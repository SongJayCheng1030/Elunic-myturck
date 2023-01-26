import { ApiProperty } from '@nestjs/swagger';
import Joi = require('joi');

export interface UpdateVariableDto {
  name: string;
  unit: string;
}

export class UpdateVariableDtoClassRequest {
  @ApiProperty()
  name!: string;
  @ApiProperty()
  unit!: string;
}

export const UpdateVariableDtoRequestSchema = Joi.object({
  name: Joi.string(),
  unit: Joi.string().allow('').optional(),
}).options({ allowUnknown: false });
