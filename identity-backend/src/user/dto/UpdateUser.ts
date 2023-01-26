import { Schema } from 'joi';
import * as Joi from 'joi';

import { User } from './User';

export interface UpdateUser {
  user: Partial<User>;
  options: {
    sendResetPasswordMail: boolean;
    setPassword: boolean;
    password?: string;
  };
}

export const UpdateUserSchema: Schema = Joi.object().keys({
  user: Joi.object()
    .keys({
      name: Joi.string().min(1).optional(),
      email: Joi.string().min(1).email().optional(),
      firstName: Joi.alternatives(null, Joi.string().min(1)).optional(),
      lastName: Joi.alternatives(null, Joi.string().min(1)).optional(),
      imageId: Joi.alternatives(null, Joi.string().uuid()).optional(),
      preferredLanguage: Joi.alternatives(null, Joi.string().min(1).max(10)).optional(),
      roles: Joi.array()
        .min(0)
        .items(
          Joi.object()
            .keys({
              id: Joi.alternatives(null, Joi.string().uuid()).optional(),
              key: Joi.alternatives(null, Joi.string().min(1)).optional(),
            })
            .unknown(true),
        ),
    })
    .required(),
  options: Joi.object()
    .keys({
      sendResetPasswordMail: Joi.boolean().default(false).optional(),
      setPassword: Joi.boolean().default(false).optional(),
      password: Joi.alternatives('', null, Joi.string().min(1).max(40)).optional(),
    })
    .optional(),
});

export const CreateUserSchema: Schema = Joi.object().keys({
  user: Joi.object()
    .keys({
      name: Joi.string().min(1).required(),
      email: Joi.string().min(1).email().required(),
      firstName: Joi.alternatives(null, Joi.string().min(1)).optional(),
      lastName: Joi.alternatives(null, Joi.string().min(1)).optional(),
      imageId: Joi.alternatives(null, Joi.string().uuid()).optional(),
      preferredLanguage: Joi.alternatives(null, Joi.string().min(1).max(10)).optional(),
      roles: Joi.array()
        .min(0)
        .items(
          Joi.object()
            .keys({
              id: Joi.alternatives(null, Joi.string().uuid()).optional(),
              key: Joi.alternatives(null, Joi.string().min(1)).optional(),
            })
            .unknown(true),
        ),
    })
    .required(),
  options: Joi.object()
    .keys({
      sendResetPasswordMail: Joi.boolean().default(false).optional(),
      setPassword: Joi.boolean().default(false).optional(),
      password: Joi.alternatives('', null, Joi.string().min(1).max(40)).optional(),
    })
    .optional(),
});
