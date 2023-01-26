import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateDocumentTypeDto, MultilangValue } from 'shared/common/models';

export class PostDocumentTypeDto implements CreateDocumentTypeDto {
  @ApiProperty({ type: Object })
  name!: MultilangValue;
}

export class PutDocumentTypeDto implements Partial<CreateDocumentTypeDto> {
  @ApiPropertyOptional({ type: Object })
  name?: MultilangValue;
}
