import { ApiProperty, ApiPropertyOptional, refs } from '@nestjs/swagger';
import * as Joi from 'joi';
import {
  CreateMaintenanceProcedureDto,
  INTERVAL_UNITS,
  IntervalUnit,
  MAX_COUNT_STEPS,
  MIN_COUNT_STEPS,
  UpdateMaintenanceProcedureDto,
} from 'shared/common/models';

import {
  CreateProcedureStepDto,
  CreateProcedureStepSchema,
} from '../../procedure-step/dto/procedure-step.dto';

export const CreateProcedureSchema = Joi.object({
  name: Joi.string()
    .max(100)
    .required(),
  description: Joi.string().max(4096),
  assetTypeId: Joi.string()
    .uuid()
    .required(),
  interval: Joi.number()
    .min(1)
    .required(),
  intervalUnit: Joi.allow(...INTERVAL_UNITS).required(),
  steps: Joi.array()
    .items(Joi.alternatives(CreateProcedureStepSchema, Joi.string().uuid()))
    .min(MIN_COUNT_STEPS)
    .max(MAX_COUNT_STEPS)
    .required(),
});

export const UpdateProcedureSchema = Joi.object({
  name: Joi.string().max(100),
  description: Joi.string().max(4096),
  interval: Joi.number().min(1),
  intervalUnit: Joi.allow(...INTERVAL_UNITS),
  steps: Joi.array()
    .items(Joi.alternatives(CreateProcedureStepSchema, Joi.string().uuid()))
    .min(MIN_COUNT_STEPS)
    .max(MAX_COUNT_STEPS),
});

export class CreateProcedureDto implements CreateMaintenanceProcedureDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({ type: String })
  description!: string;

  @ApiProperty()
  assetTypeId!: string;

  @ApiProperty()
  interval!: number;

  @ApiProperty({ enum: INTERVAL_UNITS })
  intervalUnit!: IntervalUnit;

  @ApiProperty({
    type: 'array',
    allOf: [
      {
        type: 'array',
        items: { oneOf: [...refs(CreateProcedureStepDto), { type: 'string' }] },
      },
    ],
    minItems: 1,
  })
  steps!: Array<CreateProcedureStepDto | string>;
}

export class UpdateProcedureDto implements UpdateMaintenanceProcedureDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ type: String })
  description?: string;

  @ApiPropertyOptional()
  interval?: number;

  @ApiPropertyOptional({ enum: INTERVAL_UNITS })
  intervalUnit?: IntervalUnit;

  @ApiProperty({
    type: 'array',
    allOf: [
      {
        type: 'array',
        items: { oneOf: [...refs(CreateProcedureStepDto), { type: 'string' }] },
      },
    ],
    minItems: 1,
    required: false,
  })
  steps?: Array<CreateProcedureStepDto | string>;
}
