import * as Joi from 'joi';

import { Input, TopicExtractor } from '../model';
import { Pipeline } from './pipeline';

export const INPUT_SCHEMA = Joi.object().keys({
  topic: Joi.string().required(),
  creationTime: Joi.number(),
  id: Joi.string(),
  tenantId: Joi.string(),
  type: Joi.string(),
});

export abstract class BasePipeline<TInput extends Input, TOutput> extends Pipeline<
  TInput,
  TOutput
> {
  constructor(protected topicExtractor: TopicExtractor) {
    super();
  }

  canTransform(input: Input): input is TInput {
    try {
      Joi.assert(input, INPUT_SCHEMA, { allowUnknown: true });
      return true;
    } catch (e) {
      return false;
    }
  }
}
