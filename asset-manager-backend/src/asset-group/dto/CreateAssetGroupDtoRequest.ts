import * as Joi from 'joi';

import { AssetGroupProperty } from '../asset-group.entity';

export interface CreateUpdateAssetGroupDtoRequest {
  name?: string;
  description?: string | undefined;
  properties?: AssetGroupProperty[];
}

export const CreateUpdateAssetGroupDtoRequestSchema = Joi.object({
  description: Joi.alternatives(Joi.string().max(512), null).optional(),
  name: Joi.string().max(128),
  assetType: Joi.object({
    key: Joi.string().max(128),
    name: Joi.string().max(128),
    value: Joi.alternatives(Joi.boolean(), Joi.number(), Joi.string()),
    type: Joi.string().allow('string', 'boolean', 'number'),
  }),
});
