import { ApiPropertyOptional } from '@nestjs/swagger';
import * as Joi from 'joi';

import {
  ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS,
  ENDPOINT_RESULT_QUERY_LIMIT,
} from '../../definitions';

export class FindExecutionsQuery {
  @ApiPropertyOptional({ type: [String] })
  assetId?: string | string[];

  @ApiPropertyOptional({ type: Boolean })
  completed?: boolean;

  @ApiPropertyOptional({ type: Number })
  limit!: number;

  @ApiPropertyOptional({ type: Number })
  page!: number;
}

export const FindExecutionsQuerySchema = Joi.object({
  assetId: Joi.alternatives([Joi.string().uuid(), Joi.array().items(Joi.string().uuid())]).only(),
  completed: Joi.boolean().only(),
  limit: Joi.number()
    .min(1)
    .max(ENDPOINT_RESULT_QUERY_LIMIT)
    .default(ENDPOINT_RESULT_DEFAULT_QUERY_ITEMS),
  page: Joi.number()
    .min(0)
    .default(1),
});
