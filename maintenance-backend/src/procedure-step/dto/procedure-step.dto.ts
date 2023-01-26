import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiPipe } from 'nestjs-joi';
import {
  CreateMaintenanceProcedureStepDto,
  MaintenanceProcedureStepContentDto,
  StepType,
} from 'shared/common/models';

export const MachineVariableSchema = {
  machineVariableId: Joi.string()
    .optional()
    .allow(null),
  rangeFrom: Joi.when('machineVariableId', {
    is: Joi.string(),
    then: Joi.number()
      .optional()
      .allow(null),
    otherwise: Joi.valid(null),
  }),
  rangeTo: Joi.when('machineVariableId', {
    is: Joi.string(),
    then: Joi.number()
      .optional()
      .allow(null),
    otherwise: Joi.valid(null),
  }),
};

export const CreateProcedureStepSchema = Joi.object({
  name: Joi.string()
    .max(100)
    .required(),
  description: Joi.string().required(),
  mandatory: Joi.boolean().required(),
  skippable: Joi.boolean().required(),
  type: Joi.string().valid(...Object.values(StepType)),
  key: Joi.string().optional(),
  content: Joi.any(),
  libraryOptions: Joi.object()
    .keys({
      tags: Joi.array()
        .items(Joi.string())
        .optional(),
    })
    .optional(),
  ...MachineVariableSchema,
});

const DefaultContentSchema = Joi.object({
  images: Joi.array()
    .items(Joi.string().uuid())
    .required(),
  documents: Joi.array()
    .items(Joi.string().uuid())
    .required(),
});

export const DescriptionProcedureStepSchema = CreateProcedureStepSchema.keys({
  type: Joi.allow(StepType.DESCRIPTION),
  content: DefaultContentSchema,
});

export const NumericInputProcedureStepSchema = CreateProcedureStepSchema.keys({
  type: Joi.allow(StepType.NUMERIC_INPUT),
  content: DefaultContentSchema.keys({
    label: Joi.string().required(),
    unit: Joi.string().allow(''),
  }),
});

export const TextInputProcedureStepSchema = CreateProcedureStepSchema.keys({
  type: Joi.allow(StepType.TEXT_INPUT),
  content: DefaultContentSchema.keys({
    label: Joi.string().required(),
  }),
});

export const CheckboxProcedureStepSchema = CreateProcedureStepSchema.keys({
  type: Joi.allow(StepType.CHECKBOX),
  content: DefaultContentSchema.keys({
    label: Joi.string().required(),
    default: Joi.boolean(),
  }),
});

export const STEP_VALIDATION_MAP: { [key in StepType]: Joi.ObjectSchema } = {
  [StepType.DESCRIPTION]: DescriptionProcedureStepSchema,
  [StepType.NUMERIC_INPUT]: NumericInputProcedureStepSchema,
  [StepType.TEXT_INPUT]: TextInputProcedureStepSchema,
  [StepType.CHECKBOX]: CheckboxProcedureStepSchema,
};

export const STEP_VALIDATION_PIPES = Object.entries(STEP_VALIDATION_MAP).reduce(
  (prev, [type, schema]) => ({
    ...prev,
    [type]: new JoiPipe(schema, { defaultValidationOptions: { allowUnknown: false } }),
  }),
  {} as { [key in StepType]: JoiPipe },
);

export class ProcedureStepContentDto implements MaintenanceProcedureStepContentDto {
  @ApiProperty({ type: String, isArray: true })
  images!: string[];

  @ApiProperty({ type: String, isArray: true, writeOnly: true })
  documents!: string[];

  [key: string]: unknown;
}

export class LibraryOptionsDto {
  @ApiPropertyOptional({ type: String, isArray: true })
  tags?: string[];
}

export class CreateProcedureStepDto implements CreateMaintenanceProcedureStepDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  mandatory!: boolean;

  @ApiProperty()
  skippable!: boolean;

  @ApiProperty({ enum: StepType })
  type!: StepType;

  @ApiPropertyOptional({ type: String })
  key?: string;

  @ApiProperty({ type: () => ProcedureStepContentDto })
  content!: ProcedureStepContentDto;

  @ApiPropertyOptional({ type: () => LibraryOptionsDto })
  libraryOptions?: LibraryOptionsDto;

  @ApiProperty()
  machineVariableId?: string;

  @ApiPropertyOptional()
  rangeFrom?: number;

  @ApiPropertyOptional()
  rangeTo?: number;
}
