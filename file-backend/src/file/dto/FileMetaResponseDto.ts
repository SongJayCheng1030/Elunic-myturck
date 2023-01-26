import { ApiResponseProperty } from '@nestjs/swagger';
import { FileId, FileMetaResponse } from 'shared/common/models';

export class FileMetaResponseDto implements FileMetaResponse {
  @ApiResponseProperty({
    example: '89db648c-2de0-496e-b52c-bd5497e89c8b',
  })
  id!: FileId;

  @ApiResponseProperty()
  isImage!: boolean;

  @ApiResponseProperty({ example: ['image', 'png'] })
  mimeType!: string[];

  @ApiResponseProperty({ example: 'image/png' })
  mimeTypeRaw!: string;

  @ApiResponseProperty({ example: 'icon.png' })
  name!: string;

  @ApiResponseProperty({ example: '1a79a4d60de6718e8e5b326e338ae533' })
  md5!: string;
}
