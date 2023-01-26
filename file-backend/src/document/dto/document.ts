import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as Joi from 'joi';
import { CreateDocumentDto, GetDocumentsQueryOpts, MultilangValue } from 'shared/common/models';

export class PostDocumentDto implements CreateDocumentDto {
  @ApiProperty({ type: Object })
  name!: MultilangValue;

  @ApiProperty()
  fileId!: string;

  @ApiProperty()
  typeId!: string;
}

export class PutDocumentDto implements Partial<CreateDocumentDto> {
  @ApiPropertyOptional({ type: Object })
  name?: MultilangValue;

  @ApiPropertyOptional({ type: String })
  fileId?: string;

  @ApiPropertyOptional({ type: String })
  typeId?: string;
}

export class GetDocumentsQueryParams implements GetDocumentsQueryOpts {
  @ApiPropertyOptional({ type: String })
  typeId?: string;

  @ApiPropertyOptional({ type: String })
  name?: string;

  @ApiPropertyOptional({ type: Boolean })
  withLinks?: boolean;

  @ApiPropertyOptional({ type: String, isArray: true })
  refIds?: string | string[];
}

export const GetDocumentsQueryParamsSchema = Joi.object().keys({
  typeId: Joi.string().uuid(),
  name: Joi.string(),
  withLinks: Joi.boolean(),
  refIds: Joi.alternatives(Joi.string(), Joi.array().items(Joi.string())),
});
