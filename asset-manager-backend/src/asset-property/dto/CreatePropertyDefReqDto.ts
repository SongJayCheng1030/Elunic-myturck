import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { MultilangValueSchema } from 'shared/backend/models';
import { MultilangValue } from 'shared/common/models';

import { AssetPropertyType, AssetPropertyValue } from '../asset-property-definition.entity';

export interface CreatePropertyDefReqDto {
  name: MultilangValue;
  key: string;
  type: AssetPropertyType;
  value: AssetPropertyValue | null;
  isHidden: boolean;
  isRequired: boolean;
  position: number;
}

export class CreatePropertyDefReqClassDto {
  @ApiProperty()
  name!: MultilangValue;
  @ApiProperty()
  key!: string;
  @ApiProperty()
  type!: AssetPropertyType;
  @ApiProperty()
  value!: AssetPropertyValue | null;
  @ApiProperty()
  isHidden!: boolean;
  @ApiProperty()
  isRequired!: boolean;
  @ApiProperty()
  position!: number;
}

export const CreatePropertyDefReqSchemaRaw = {
  name: MultilangValueSchema.required(),
  type: Joi.string()
    .allow(...Object.values(AssetPropertyType))
    .required(),
  key: Joi.string()
    .regex(/^[a-zA-Z\-_][a-zA-Z0-9\-_]+$/)
    .required(),
  value: Joi.any().required(),
  isHidden: Joi.boolean().default(false).optional(),
  isRequired: Joi.boolean().default(false).optional(),
  position: Joi.number().min(0).default(0).optional(),
};

export const CreatePropertyDefReqSchema = Joi.object(CreatePropertyDefReqSchemaRaw);
