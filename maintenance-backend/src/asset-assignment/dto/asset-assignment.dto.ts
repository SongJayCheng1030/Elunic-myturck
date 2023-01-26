import { ApiPropertyOptional } from '@nestjs/swagger';
import * as Joi from 'joi';

export const FindAssignmentQuerySchema = Joi.object({
  assetId: Joi.string().uuid(),
});

export class FindAssignmentQuery {
  @ApiPropertyOptional()
  assetId!: string;
}
