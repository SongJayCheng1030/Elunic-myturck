import { ApiProperty } from '@nestjs/swagger';
import { AssetEntity } from 'src/asset/asset.entity';

import { AssetGroupEntity, AssetGroupProperty } from '../asset-group.entity';

export interface AssetGroupDto {
  id: string;
  createdAt: string;
  updatedAt: string;

  name: string;
  description: string | null;
  assets?: AssetEntity[];
  properties?: AssetGroupProperty[];
}

export class AssetGroupClassDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  description!: string;
  @ApiProperty()
  assets?: AssetEntity[];
  @ApiProperty()
  properties?: AssetGroupProperty[];
  @ApiProperty()
  createdAt!: string;
  @ApiProperty()
  updatedAt!: string;
}
export function toExternal(ety: AssetGroupEntity): AssetGroupDto {
  return {
    ...ety,
    createdAt: ety.createdAt?.toISOString(),
    updatedAt: ety.updatedAt?.toISOString(),
  };
}
