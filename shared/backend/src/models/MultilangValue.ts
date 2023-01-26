import * as Joi from 'joi';

export const MultilangValueSchema = Joi.object()
  .pattern(
    Joi.string()
      .min(2)
      .max(9)
      .regex(/[a-zA-Z]{2,4}\-[a-zA-Z]{2,4}/),
    Joi.string().min(1),
  )
  .min(1);
