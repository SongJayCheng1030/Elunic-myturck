import { ApiProperty } from '@nestjs/swagger';

export class AssetMapItemClassDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  left!: number;

  @ApiProperty()
  top!: number;

  @ApiProperty()
  assetId?: string | null;

  @ApiProperty()
  imageId?: string | null;
}
