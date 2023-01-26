import { MultilangValue } from './MultilangValue';

export interface DocumentDto {
  id: string;
  name: MultilangValue;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  fileId: string;
  typeId: string;
  links?: DocumentLinkDto[];
}

// Used in frontend only
export interface FullDocumentDto extends DocumentDto {
  type?: DocumentTypeDto;
}

export interface CreateDocumentDto {
  name: MultilangValue;
  fileId: string;
  typeId: string;
}

export interface DocumentTypeDto {
  id: string;
  name: MultilangValue;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  resourceId?: string;
}

export interface CreateDocumentTypeDto {
  name: MultilangValue;
}

export interface DocumentLinkDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  refId: string;
  refType: string;
}

export interface CreateDocumentLinkDto {
  refId: string;
  refType: string;
}

export interface DocumentActivityDto {
  id: string;
  createdAt: Date;
  createdBy: string;
  refId: string;
  type: DocumentActivityType;
}

export enum DocumentActivityType {
  CREATED = 'created',
  UPDATED = 'updated',
  TYPE_CHANGED = 'type_changed',
  FILE_REPLACED = 'file_replaced',
  REF_ASSIGNED = 'ref_assigned',
  REF_UNASSIGNED = 'ref_unassigned',
  DELETED = 'deleted',
}

export interface GetDocumentsQueryOpts {
  typeId?: string;
  name?: string;
  withLinks?: boolean;
  refIds?: string | string[];
}
