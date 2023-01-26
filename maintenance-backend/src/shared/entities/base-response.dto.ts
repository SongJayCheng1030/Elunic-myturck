import { ApiResponseProperty } from '@nestjs/swagger';

export class BaseResponseDto {
  @ApiResponseProperty()
  id!: string;
}
