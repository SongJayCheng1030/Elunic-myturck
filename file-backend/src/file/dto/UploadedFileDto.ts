import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'nestjs-joi';

@JoiSchemaOptions({ allowUnknown: false })
export class UploadedFileDto {
  @JoiSchema(Joi.string().required().valid('file'))
  fieldname!: string;

  @JoiSchema(Joi.string().required())
  originalname!: string;

  @JoiSchema(Joi.string().required())
  encoding!: string;

  @JoiSchema(Joi.string().required())
  mimetype!: string;

  @JoiSchema(Joi.number().required())
  size!: number;

  @JoiSchema(Joi.string().required())
  filename!: string;

  /**
   * Folder path where the file has been uploaded to
   */
  @JoiSchema(Joi.string().required())
  destination!: string;

  /**
   * Full file path incl. file name
   */
  @JoiSchema(Joi.string().required())
  path!: string;
}
