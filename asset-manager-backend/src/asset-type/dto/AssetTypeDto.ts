import { ApiProperty } from '@nestjs/swagger';
import {
  AssetTypeDto,
  ISA95EquipmentHierarchyModelElement,
  MultilangValue,
} from 'shared/common/models';

import { AssetClassDto, AssetDto } from '../../asset/dto/AssetDto';

export class AssetTypeClassDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  isBuiltIn!: boolean;

  @ApiProperty()
  name!: MultilangValue;

  @ApiProperty()
  description!: string | null;

  @ApiProperty()
  extendsType!: AssetTypeDto | null;

  @ApiProperty()
  equipmentType!: ISA95EquipmentHierarchyModelElement;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  deletedAt!: string;

  @ApiProperty()
  isDeleted!: boolean;

  @ApiProperty({ type: () => [AssetClassDto] })
  assets!: AssetDto[];
}
