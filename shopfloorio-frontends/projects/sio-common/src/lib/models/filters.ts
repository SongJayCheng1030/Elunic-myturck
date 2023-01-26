export interface Sorting {
  target: string;
  order: 'ASC' | 'DESC';
}

export interface Filters {
  endDate?: Date | null;
  startDate?: Date | null;
  status?: string;
  assetId?: string;
  sorting?: Sorting;
  responsible?: string;
  searchString?: string;
  maintenanceId?: string;
  taskId?: string;
  isInternal?: boolean;
}
