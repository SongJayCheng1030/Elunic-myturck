import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'nestjs-joi';

@JoiSchemaOptions({
  allowUnknown: false,
})
export class GetImageQueryDto {
  @ApiProperty()
  @JoiSchema(Joi.number().integer().positive().optional())
  w?: number;

  @ApiProperty()
  @JoiSchema(Joi.number().integer().positive().optional())
  h?: number;

  @ApiProperty({
    example: '#112233',
  })
  @JoiSchema(
    Joi.string()
      .regex(/^#?([0-9a-f]{6})$/)
      .optional()
      .default(''),
  )
  bg!: string;

  @ApiProperty({
    enum: ['cover', 'contain', 'fill', 'inside', 'outside'],
  })
  @JoiSchema(
    Joi.string()
      .valid('cover', 'contain', 'fill', 'inside', 'outside')
      .optional()
      .default('contain'),
  )
  fit!: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}
