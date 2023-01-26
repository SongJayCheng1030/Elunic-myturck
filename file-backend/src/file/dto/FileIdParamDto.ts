import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'nestjs-joi';
import { FileId } from 'shared/common/models';

@JoiSchemaOptions({ allowUnknown: false })
export class FileIdParamDto {
  @ApiProperty({
    example: '89db648c-2de0-496e-b52c-bd5497e89c8b',
  })
  @JoiSchema(Joi.string().required())
  fileId!: FileId;
}
