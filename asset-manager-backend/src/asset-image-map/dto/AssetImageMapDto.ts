import { ApiProperty } from '@nestjs/swagger';

import { AssetMapItemClassDto } from './AssetImageMapItemDto';

export class AssetImageMapClassDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  backgroundImageId!: string;

  @ApiProperty()
  mapItems?: AssetMapItemClassDto[];
}
