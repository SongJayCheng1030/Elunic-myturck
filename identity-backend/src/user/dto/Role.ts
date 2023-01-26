import * as Joi from 'joi';
import { MultilangValue } from 'shared/common/models';
import { MultilangJoiSchema } from 'shared/nestjs';
import { RightUnite, RoleUnite } from 'src/keycloak/dto/RoleUnite';

export type Role = Omit<RoleUnite, 'keycloakId' | 'rights'> & { rights: Right[] };

export type ShortRole = Omit<RoleUnite, 'keycloakId' | 'rights'>;

export type Right = Omit<RightUnite, 'keycloakId'>;

export interface CreateRoleDto {
  key: string;
  name: MultilangValue;
  description?: MultilangValue;
  rights: RightUnite[];
}

export const CreateRoleDtoSchema = Joi.object({
  key: Joi.alternatives('', null, Joi.string().min(1).max(100)).optional(),
  name: MultilangJoiSchema().required(),
  description: Joi.alternatives(null, MultilangJoiSchema()).optional(),
  rights: Joi.array()
    .items(
      Joi.object({
        id: Joi.alternatives('', null, Joi.string().uuid()).optional(),
        key: Joi.alternatives('', null, Joi.string().min(1).max(100)).optional(),
      }).unknown(true),
    )
    .min(1),
}).unknown(true);

export interface UpdateRoleDto {
  name: MultilangValue;
  description?: MultilangValue;
  rights: RightUnite[];
}

export const UpdateRoleDtoSchema = Joi.object({
  key: Joi.alternatives('', null, Joi.string().min(1).max(100)).optional(),
  name: MultilangJoiSchema().required(),
  description: Joi.alternatives(null, MultilangJoiSchema()).optional(),
  rights: Joi.array()
    .items(
      Joi.object({
        id: Joi.alternatives('', null, Joi.string().uuid()).optional(),
        key: Joi.alternatives('', null, Joi.string().min(1).max(100)).optional(),
      }).unknown(true),
    )
    .min(1),
}).unknown(true);
