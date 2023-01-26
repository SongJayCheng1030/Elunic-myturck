import { ApiProperty } from '@nestjs/swagger';

export class TenantSettingsDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  value!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  createdAt!: string;
}
