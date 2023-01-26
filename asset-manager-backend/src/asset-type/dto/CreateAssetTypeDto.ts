import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { MultilangValueSchema } from 'shared/backend/models';
import { ISA95EquipmentHierarchyModelElement, MultilangValue } from 'shared/common/models';

export interface CreateAssetTypeDto {
  name: MultilangValue;
  description: string | null;
  extendsType:
    | string
    | {
        id: string;
      };
  equipmentType: ISA95EquipmentHierarchyModelElement;
}

export const CreateAssetTypeSchema = Joi.object({
  name: MultilangValueSchema.required(),
  description: Joi.string().max(16384).allow(null).optional(),
  extendsType: Joi.alternatives(
    Joi.string().uuid(),
    Joi.object({
      id: Joi.string().uuid(),
    }),
    null,
  ).optional(),
  equipmentType: Joi.string()
    .allow(...Object.values(ISA95EquipmentHierarchyModelElement))
    .required(),
});

export class CreateAssetTypeClassDto {
  @ApiProperty()
  name!: MultilangValue;
  @ApiProperty()
  description!: string | null;
  @ApiProperty()
  extendsType!:
    | string
    | {
        id: string;
      };
  @ApiProperty()
  equipmentType!: ISA95EquipmentHierarchyModelElement;
}
