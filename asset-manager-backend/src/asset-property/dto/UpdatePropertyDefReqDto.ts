import { ApiProperty } from '@nestjs/swagger';
import { MultilangValue } from 'shared/common/models';

import { AssetPropertyType, AssetPropertyValue } from '../asset-property-definition.entity';
import {
  CreatePropertyDefReqDto,
  CreatePropertyDefReqSchema,
  CreatePropertyDefReqSchemaRaw,
} from './CreatePropertyDefReqDto';

export type UpdatePropertyDefReqDto = CreatePropertyDefReqDto;
export class UpdatePropertyDefReqClassDto {
  @ApiProperty()
  name?: MultilangValue;
  @ApiProperty()
  key?: string;
  @ApiProperty()
  type?: AssetPropertyType;
  @ApiProperty()
  value?: AssetPropertyValue | null;
  @ApiProperty()
  isHidden?: boolean;
  @ApiProperty()
  isRequired?: boolean;
  @ApiProperty()
  position?: number;
}

export const UpdatePropertyDefReqSchema = CreatePropertyDefReqSchema.fork(
  Object.keys(CreatePropertyDefReqSchemaRaw),
  schema => schema.optional(),
);
