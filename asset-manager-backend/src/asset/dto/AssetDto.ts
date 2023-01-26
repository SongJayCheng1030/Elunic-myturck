import { ApiProperty } from '@nestjs/swagger';
import {
  AssetAliasType,
  AssetImageMapDto,
  AssetTypeDto,
  MultilangValue,
} from 'shared/common/models';

export interface AssetDto {
  id: string;
  createdAt: string;
  updatedAt: string;

  isDeleted: boolean;
  deletedAt?: string;

  description: string | null;
  imageId: string | null;
  name: MultilangValue;

  aliases?: AssetAliasDto[];
  assetType?: AssetTypeDto;
  documents?: AssetDocumentDto[];
  imageMap: AssetImageMapDto | null;
}

export interface AssetDocumentDto {
  id: string;
  documentId: string;
  description: string | null;
  createdAt: string;
  createdBy: string;
  documentType: string | null;
}

export class AssetDocumentClassDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  documentId!: string;
  @ApiProperty()
  description!: string | null;
  @ApiProperty()
  createdAt!: string;
  @ApiProperty()
  createdBy!: string;
  @ApiProperty()
  documentType!: string | null;
}

export interface AssetAliasDto {
  id: string;
  assetId: string;
  assetName: MultilangValue;
  alias: string;
  type: AssetAliasType;
  description: string | null;
  createdAt: string;
  createdBy: string;
}

export class AssetAliasClassDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  assetId!: string;
  @ApiProperty()
  assetName!: MultilangValue;
  @ApiProperty()
  alias!: string;
  @ApiProperty()
  type!: AssetAliasType;
  @ApiProperty()
  description!: string | null;
  @ApiProperty()
  createdAt!: string;
  @ApiProperty()
  createdBy!: string;
}

export class AssetClassDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  createdAt!: string;
  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  isDeleted!: boolean;
  @ApiProperty()
  deletedAt?: string;

  @ApiProperty()
  description!: string | null;
  @ApiProperty()
  imageId!: string | null;
  @ApiProperty()
  name!: MultilangValue;

  @ApiProperty({ type: () => [AssetAliasClassDto] })
  aliases?: AssetAliasDto[];
  @ApiProperty()
  assetType?: AssetTypeDto;
  @ApiProperty({ type: () => [AssetDocumentClassDto] })
  documents?: AssetDocumentDto[];
}
