import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiPipe } from 'nestjs-joi';
import {
  CreateMaintenanceProcedureLibraryStepDto,
  MaintenanceProcedureStepContentDto,
  StepType,
  UpdateMaintenanceProcedureLibraryStepDto,
} from 'shared/common/models';

import { MachineVariableSchema, ProcedureStepContentDto } from './procedure-step.dto';

export const CreateProcedureLibraryStepSchema = Joi.object({
  name: Joi.string()
    .max(100)
    .required(),
  description: Joi.string().required(),
  mandatory: Joi.boolean().required(),
  skippable: Joi.boolean().required(),
  type: Joi.string().valid(...Object.values(StepType)),
  key: Joi.string().optional(),
  content: Joi.any(),
  tags: Joi.array()
    .items(Joi.string())
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

const NumericInputProcedureContent = DefaultContentSchema.keys({
  label: Joi.string().required(),
  unit: Joi.string().allow(''),
});

const TextInputProcedureContent = DefaultContentSchema.keys({
  label: Joi.string().required(),
});

const CheckboxInputProcedureContent = DefaultContentSchema.keys({
  label: Joi.string().required(),
  default: Joi.boolean(),
});

export const DescriptionProcedureLibraryStepSchema = CreateProcedureLibraryStepSchema.keys({
  type: Joi.allow(StepType.DESCRIPTION),
  content: DefaultContentSchema,
});

export const NumericInputProcedureLibraryStepSchema = CreateProcedureLibraryStepSchema.keys({
  type: Joi.allow(StepType.NUMERIC_INPUT),
  content: NumericInputProcedureContent,
});

export const TextInputProcedureLibraryStepSchema = CreateProcedureLibraryStepSchema.keys({
  type: Joi.allow(StepType.TEXT_INPUT),
  content: TextInputProcedureContent,
});

export const CheckboxProcedureLibraryStepSchema = CreateProcedureLibraryStepSchema.keys({
  type: Joi.allow(StepType.CHECKBOX),
  content: CheckboxInputProcedureContent,
});

export const LIBRARY_STEP_VALIDATION_MAP: { [key in StepType]: Joi.ObjectSchema } = {
  [StepType.DESCRIPTION]: DescriptionProcedureLibraryStepSchema,
  [StepType.NUMERIC_INPUT]: NumericInputProcedureLibraryStepSchema,
  [StepType.TEXT_INPUT]: TextInputProcedureLibraryStepSchema,
  [StepType.CHECKBOX]: CheckboxProcedureLibraryStepSchema,
};

export const LIBRARY_STEP_VALIDATION_PIPES = Object.entries(LIBRARY_STEP_VALIDATION_MAP).reduce(
  (prev, [type, schema]) => ({
    ...prev,
    [type]: new JoiPipe(schema, { defaultValidationOptions: { allowUnknown: false } }),
  }),
  {} as { [key in StepType]: JoiPipe },
);

export class ProcedureLibraryStepContentDto implements MaintenanceProcedureStepContentDto {
  @ApiProperty()
  images!: string[];

  @ApiProperty()
  documents!: string[];

  [key: string]: unknown;
}

export const UpdateProcedureLibraryStepSchema = Joi.object({
  name: Joi.string().max(100),
  description: Joi.string(),
  mandatory: Joi.boolean(),
  skippable: Joi.boolean(),
  tags: Joi.array()
    .items(Joi.string())
    .optional(),
  content: Joi.alternatives(
    DefaultContentSchema,
    NumericInputProcedureContent,
    TextInputProcedureContent,
    CheckboxInputProcedureContent,
  ),
  ...MachineVariableSchema,
});

export class CreateProcedureLibraryStepDto implements CreateMaintenanceProcedureLibraryStepDto {
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

  @ApiPropertyOptional({ type: String, isArray: true })
  tags?: string[];

  @ApiProperty()
  machineVariableId?: string;

  @ApiPropertyOptional()
  rangeFrom?: number;

  @ApiPropertyOptional()
  rangeTo?: number;
}

export class UpdateProcedureLibraryStepDto implements UpdateMaintenanceProcedureLibraryStepDto {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  mandatory?: boolean;

  @ApiProperty()
  skippable?: boolean;

  @ApiProperty({ type: () => ProcedureStepContentDto })
  content?: ProcedureStepContentDto;

  @ApiPropertyOptional({ type: String, isArray: true })
  tags?: string[];

  @ApiProperty()
  machineVariableId?: string;

  @ApiPropertyOptional()
  rangeFrom?: number;

  @ApiPropertyOptional()
  rangeTo?: number;
}
