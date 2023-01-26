import { ApiProperty } from '@nestjs/swagger';

import { AssetClassDto, AssetDto } from '../../asset/dto/AssetDto';

export interface AssetTreeNodeDto extends AssetDto {
  children: AssetTreeNodeDto[];
}

export class AssetTreeNodeClassDto extends AssetClassDto {
  @ApiProperty({ type: () => Array })
  children!: AssetTreeNodeClassDto[];
}
