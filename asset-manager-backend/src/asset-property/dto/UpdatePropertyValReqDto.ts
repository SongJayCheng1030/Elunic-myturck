import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

import { AssetPropertyValue } from '../asset-property-definition.entity';
import { CreatePropertyDefReqSchemaRaw } from './CreatePropertyDefReqDto';

export interface UpdatePropertyValReqDto {
  value?: AssetPropertyValue | null;
  isHidden?: boolean | null;
  isRequired?: boolean | null;
  position?: number | null;
}

export class UpdatePropertyValReqClassDto {
  @ApiProperty()
  value?: AssetPropertyValue | null;
  @ApiProperty()
  isHidden?: boolean | null;
  @ApiProperty()
  isRequired?: boolean | null;
  @ApiProperty()
  position?: number | null;
}

export const UpdatePropertyValReqSchema = Joi.object({
  value: CreatePropertyDefReqSchemaRaw.value.optional(),
  isHidden: CreatePropertyDefReqSchemaRaw.isHidden.optional(),
  isRequired: CreatePropertyDefReqSchemaRaw.isRequired.optional(),
  position: CreatePropertyDefReqSchemaRaw.position.optional(),
});
