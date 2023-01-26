import { ApiProperty } from '@nestjs/swagger';
import Joi = require('joi');
import { CreateMaintenanceExecutionStepResultDto, StepResultStatus } from 'shared/common/models';

export const CreateStepResultSchema = Joi.object({
  status: Joi.allow(...Object.values(StepResultStatus)).required(),
  value: Joi.any(),
});

export class CreateStepResultDto implements CreateMaintenanceExecutionStepResultDto {
  @ApiProperty({ type: 'enum', enum: StepResultStatus })
  status!: StepResultStatus;

  @ApiProperty()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
