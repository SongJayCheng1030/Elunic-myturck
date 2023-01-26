import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const FindAssignmentOfProcedureParamsSchema = Joi.object({
  assetId: Joi.string().uuid(),
  id: Joi.string().uuid(),
});

export class FindAssignmentOfProcedureParams {
  @ApiProperty()
  assetId!: string;

  @ApiProperty()
  id!: string;
}
