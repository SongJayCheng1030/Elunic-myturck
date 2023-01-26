import { ApiProperty } from '@nestjs/swagger';

import { TenantSettingsDto } from '../../tenant-settings/dto/TenantSettingsDto';

export class TenantDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string | null;

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty()
  ownerId!: string | null;

  @ApiProperty()
  tenantSettings!: TenantSettingsDto[];

  @ApiProperty()
  createdBy!: string | null;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  createdAt!: string;
}
