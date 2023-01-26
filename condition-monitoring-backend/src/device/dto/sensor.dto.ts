import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const SensorConfigSchema = Joi.object({
  sensorName: Joi.string(),
  sensorConfig: Joi.any(),
});

export class SensorConfigDto {
  @ApiProperty()
  sensorName!: string;

  @ApiProperty()
  sensorConfig!: any;
}
