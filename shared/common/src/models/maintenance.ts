export const INTERVAL_UNITS = ['hours', 'days', 'months', 'years'] as const;
export type IntervalUnit = typeof INTERVAL_UNITS[number];

export enum StepType {
  DESCRIPTION = 'description',
  NUMERIC_INPUT = 'numeric_input',
  TEXT_INPUT = 'text_input',
  CHECKBOX = 'checkbox',
}

export interface MaintenanceAssignmentDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  assetId: string;
  active: boolean;
  procedureId: string;
  procedureName: string;
}

export interface MaintenanceProcedureDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  assetTypeId: string;
  interval: number;
  intervalUnit: IntervalUnit;
  steps: MaintenanceProcedureStepDto[];
}

export const SIMPLE_EDIT_PROCEDURE_PROPS: Array<keyof MaintenanceProcedureDto> = [
  'name',
  'description',
  'interval',
  'intervalUnit',
];

export interface MaintenanceProcedureStepContentDto {
  images: string[];
  documents: string[];
  [key: string]: unknown;
}

export interface MaintenanceProcedureStepDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  mandatory: boolean;
  skippable: boolean;
  position: number;
  tags?: string[];
  type: StepType;
  parentId?: string;
  key?: string;
  content: MaintenanceProcedureStepContentDto;
  machineVariableId?: string;
  rangeFrom?: number;
  rangeTo?: number;
}

export interface StepTagsDto {
  name: string;
  updatedAt: string;
  createdAt: string;
}

export type MaintenanceProcedureLibraryStepDto = Omit<MaintenanceProcedureStepDto, 'position'>;

export type CreateMaintenanceProcedureDto = Omit<
  MaintenanceProcedureDto,
  'id' | 'createdAt' | 'updatedAt' | 'steps'
> & { steps: Array<CreateMaintenanceProcedureStepDto | string> };

export type UpdateMaintenanceProcedureDto = Partial<
  Omit<MaintenanceProcedureDto, 'id' | 'createdAt' | 'updatedAt' | 'steps' | 'assetTypeId'> & {
    steps?: Array<CreateMaintenanceProcedureStepDto | string>;
  }
>;

export type CreateMaintenanceProcedureStepDto = Omit<
  MaintenanceProcedureStepDto,
  'id' | 'createdAt' | 'updatedAt' | 'position'
>;

export type CreateMaintenanceProcedureLibraryStepDto = Omit<
  MaintenanceProcedureLibraryStepDto,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateMaintenanceProcedureLibraryStepDto = Partial<
  Omit<MaintenanceProcedureLibraryStepDto, 'id' | 'createdAt' | 'updatedAt' | 'type' | 'key'>
>;

export enum StepResultStatus {
  OK = 'ok',
  ERROR = 'error',
  SKIPPED = 'skipped',
}

export interface MaintenanceExecutionStepResultDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: StepResultStatus;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  procedureStepId: string;
}

export type CreateMaintenanceExecutionStepResultDto = Omit<
  MaintenanceExecutionStepResultDto,
  'id' | 'createdAt' | 'updatedAt' | 'procedureStepId'
>;

export enum ExecutionState {
  OPEN = 'open',
  DUE_SOON = 'due_soon',
  OVER_DUE = 'over_due',
  COMPLETED = 'completed',
  PARTIALLY_COMPLETED = 'partially_completed',
}

export interface MaintenanceExecutionDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  completedAt: Date | null;
  completedBy: string | null;
  state: ExecutionState;
  stepResults?: MaintenanceExecutionStepResultDto[];
  completedSteps: number;
  totalSteps: number;
  totalMandatorySteps: number;
  procedureId: string;
  procedureName: string;
  procedureDescription: string;
  procedureInterval: number;
  procedureIntervalUnit: IntervalUnit;
  procedureSteps?: MaintenanceProcedureStepDto[];
  procedureVersion?: number;
  assetId: string;
  dueDate: Date;
}

export const MIN_COUNT_STEPS = 1;
export const MAX_COUNT_STEPS = 50;
