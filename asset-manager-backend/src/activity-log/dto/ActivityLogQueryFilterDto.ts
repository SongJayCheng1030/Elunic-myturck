import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

import {
  ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS,
  ENDPOINT_RESULT_QUERY_LIMIT,
} from '../../definitions';

export interface ActivityLogQueryFilterDto {
  id?: string; // Only internal use
  objectType?: string;
  refId?: string | null;
  limit: number;
  page: number;
}

export const ActivityLogQueryFilterSchema = Joi.object({
  objectType: Joi.string().max(50).min(1).optional(),
  refId: Joi.alternatives(Joi.string().uuid(), null).optional(),
  limit: Joi.number()
    .min(1)
    .max(ENDPOINT_RESULT_QUERY_LIMIT)
    .default(ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS)
    .optional(),
  page: Joi.number().min(0).default(1).optional(),
});

export class ActivityLogQueryFilterClassDto {
  @ApiProperty()
  id?: string; // Only internal use
  @ApiProperty()
  objectType?: string;
  @ApiProperty()
  refId?: string | null;
  @ApiProperty()
  limit!: number;
  @ApiProperty()
  page!: number;
}
