import { ApiProperty } from '@nestjs/swagger';

export class GroupDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}
