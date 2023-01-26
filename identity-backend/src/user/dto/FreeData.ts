import * as Joi from 'joi';

export interface FreeData {
  [key: string]: string | number | boolean | null;
}

export const FreeDataUpdateSchema = Joi.object().pattern(
  /[a-zA-Z\._\-]{1,21}/,
  Joi.alternatives(null, Joi.string().max(1024), Joi.number(), Joi.boolean()),
);
