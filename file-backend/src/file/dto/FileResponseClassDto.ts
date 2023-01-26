import { ApiResponseProperty } from '@nestjs/swagger';

import { FileMetaResponseDto } from './FileMetaResponseDto';

export class FileResponseDto extends FileMetaResponseDto {
  @ApiResponseProperty()
  url!: string;
}
