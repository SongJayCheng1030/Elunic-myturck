import { ISA95EquipmentHierarchyModelElement } from './ISA95';
import { MultilangValue } from './MultilangValue';

export interface AssetDto {
  id: string;
  createdAt: string;
  updatedAt: string;

  isDeleted: boolean;
  deletedAt?: string;

  description: string | null;
  imageId: string | null;
  name: MultilangValue;

  imageMap?: AssetImageMapDto;
  aliases?: AssetAliasDto[];
  assetType: AssetTypeDto;
  documents?: AssetDocumentDto[];
  properties?: UnitedPropertyDto[];
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

export interface AssetDocumentDto {
  id: string;
  documentId: string;
  description: string | null;
  createdAt: string;
  createdBy: string;
  documentType: string | null;
}

export enum AssetPropertyType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  FILE = 'FILE',
}
export type AssetPropertyValue = number | string | Date | boolean;

export enum AssetAliasType {
  GENERAL = 'GENERAL',
  QR_CODE = 'QR_CODE',
}

export interface UnitedPropertyDto {
  id: string;
  key: string;
  name: MultilangValue;
  createdAt: string;
  updatedAt: string;

  value: AssetPropertyValue | null;
  position: number | null;
  isHidden: boolean | null;
  type: string;
  isRequired: boolean | null;

  // Just read-only data for the state of property
  meta: {
    isOverwritten: boolean;
    fieldsOverwritten: string[];
    isForeignAssetType: boolean;
    originAssetType: string;
  };
}

export type CreateUnitedPropertyDto = Omit<UnitedPropertyDto, 'id' | 'createdAt' | 'updatedAt'>;

export interface AssetTreeNodeDto extends AssetDto {
  children: AssetTreeNodeDto[];
  level?: number;
}

export interface AssetTypeDto {
  id: string;
  isBuiltIn: boolean;
  name: MultilangValue;
  description: string | null;
  extendsType: AssetTypeDto | null;
  equipmentType: ISA95EquipmentHierarchyModelElement;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isDeleted: boolean;
  assets?: AssetDto[];
}

export interface CreateAssetTypeDto {
  name: MultilangValue;
  description?: string;
  extendsType?: string;
  equipmentType: ISA95EquipmentHierarchyModelElement;
}

export interface ActivityLog {
  id: string;
  objectType: string;
  activityType: string;
  createdAt: string;
  createdBy: string;
}

export interface AssetGroupDto {
  id: string;
  properties: { [key: string]: string };
  name: string;
  description: string;
  assets: AssetDto[];
}

export interface AssetMapItemDto {
  id: string;
  left: number;
  top: number;
  color?: string;
  isVisible?: boolean;
  imageId?: string | null;
  assetId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AssetImageMapDto {
  id: string;
  backgroundImageId?: string | null;
  mapItems?: AssetMapItemDto[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function getChildren(asset: AssetTreeNodeDto): AssetTreeNodeDto[] {
  return Array.isArray(asset.children) ? [...asset.children] : [];
}

export function findAssetsByCriteria(
  tree: AssetTreeNodeDto,
  criteria: (a: AssetTreeNodeDto) => boolean,
): AssetTreeNodeDto[] {
  const found = [] as AssetTreeNodeDto[];
  if (criteria(tree)) {
    found.push(tree);
  }
  if (tree.children?.length) {
    for (const child of tree.children) {
      found.push(...findAssetsByCriteria(child, criteria));
    }
  }
  return found;
}

export function findParent(tree: AssetTreeNodeDto, id: string): AssetTreeNodeDto | undefined {
  return findAssetsByCriteria(tree, a => getChildren(a).some(c => c.id === id))[0];
}

export function getAllDescendants(asset: AssetTreeNodeDto): AssetTreeNodeDto[] {
  const children = getChildren(asset);
  for (const child of children) {
    children.push(...getAllDescendants(child));
  }
  const uniqueChildren = new Map(children.map(child => [child.id, child]));
  return [...uniqueChildren.values()];
}

export function getAllAncestors(tree: AssetTreeNodeDto, asset: AssetDto): AssetTreeNodeDto[] {
  const parent = findParent(tree, asset.id);
  if (parent) {
    return [...getAllAncestors(tree, parent), parent];
  }
  return [];
}

export function flattenTrees(assets: AssetTreeNodeDto[]): AssetTreeNodeDto[] {
  const descendants = assets.reduce(
    (prev, curr) => [...prev, ...getAllDescendants(curr)],
    [] as AssetTreeNodeDto[],
  );
  return [...assets, ...descendants];
}

export function getProp(asset: AssetDto, key: string) {
  const prop = asset.properties?.find(p => p.key === key);
  return prop ? prop.value : '';
}
