import * as Joi from 'joi';

export interface SetSettingsDto {
  [key: string]: string;
}

export const SetSettingsDtoSchema = Joi.object().pattern(
  /^[a-zA-Z0-9\_]{1,}$/,
  Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean()),
);
