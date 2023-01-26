import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { MultilangValueSchema } from 'shared/backend/models';
import { AssetAliasType, MultilangValue } from 'shared/common/models';

export const SIMPLE_PROPS = ['description', 'imageId', 'name'];

export interface UpdateAssetDtoRequest {
  description?: string | null;
  imageId?: string | null;
  name?: MultilangValue;

  /**
   * It might be either the `assetId` given or an object
   * with the `assetId`. Therefore it is compatible with
   * sending the return structure directly to this endpoint
   */
  assetType?:
    | string
    | {
        id: string;
      };

  aliases?: UpdateAssetAliasDtoRequest[];
  documents?: UpdateAssetDocumentDtoRequest[];
}

export interface UpdateAssetAliasDtoRequest {
  id?: string;
  alias: string;
  type: AssetAliasType;
  description: string | null;
}

export interface UpdateAssetDocumentDtoRequest {
  id?: string;
  documentId: string;
  description: string | null;
  documentType: string | null;
}

export const UpdateAssetDtoRequestSchema = Joi.object({
  description: Joi.alternatives(Joi.string().max(1500), null).optional(),
  imageId: Joi.alternatives(Joi.string().uuid(), null).optional(),
  name: MultilangValueSchema.optional(),

  assetType: Joi.alternatives(
    Joi.string().uuid(),
    Joi.object({
      id: Joi.string().uuid(),
    }),
  ).optional(),

  aliases: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().uuid().optional(),
        alias: Joi.string().min(1).max(64).required(),
        type: Joi.string().required(),
        description: Joi.alternatives(Joi.string().max(1500), null).optional(),
      }),
    )
    .optional(),

  documents: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().uuid().optional(),
        documentId: Joi.string().max(36).required(),
        description: Joi.alternatives(Joi.string().max(1500), null).optional(),
        documentType: Joi.alternatives(Joi.string().max(100), null).optional(),
      }),
    )
    .optional(),
});

export class UpdateAssetAliasDtoClassRequest {
  @ApiProperty()
  id?: string;
  @ApiProperty()
  alias!: string;
  @ApiProperty()
  type!: AssetAliasType;
  @ApiProperty()
  description!: string | null;
}

export class UpdateAssetDocumentDtoClassRequest {
  @ApiProperty()
  id?: string;
  @ApiProperty()
  documentId!: string;
  @ApiProperty()
  description!: string | null;
  @ApiProperty()
  documentType!: string | null;
}

export class UpdateAssetDtoClassRequest {
  @ApiProperty()
  description?: string | null;
  @ApiProperty()
  imageId?: string | null;
  @ApiProperty()
  name?: MultilangValue;

  /**
   * It might be either the `assetId` given or an object
   * with the `assetId`. Therefore it is compatible with
   * sending the return structure directly to this endpoint
   */
  @ApiProperty()
  assetType?:
    | string
    | {
        id: string;
      };

  @ApiProperty({ type: () => [UpdateAssetAliasDtoClassRequest] })
  aliases?: UpdateAssetAliasDtoClassRequest[];
  @ApiProperty({ type: () => [UpdateAssetDocumentDtoClassRequest] })
  documents?: UpdateAssetDocumentDtoClassRequest[];
}
