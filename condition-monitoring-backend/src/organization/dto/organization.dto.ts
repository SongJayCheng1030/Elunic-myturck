import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { TenantId } from 'shared/common/types';

export const CreateOrganizationSchema = Joi.object({
  tenantId: Joi.string().uuid(),
  name: Joi.any(),
  deviceIds: Joi.array().items(Joi.string()),
});

export class CreateOrganizationDto {
  @ApiProperty()
  tenantId!: TenantId;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  deviceIds!: string[];
}
