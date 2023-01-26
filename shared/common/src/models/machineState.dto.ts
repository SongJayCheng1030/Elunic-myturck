export interface MachineStateDto {
  name: string;
  value: number;
}

export enum MachineState {
  OFFLINE = 'OFFLINE',
  NOT_REACHABLE = 'NOT_REACHABLE',
  ERROR = 'ERROR',
  RUNNING_WITH_WARNING = 'RUNNING_WITH_WARNING',
  STOPPED_WITH_WARNING = 'STOPPED_WITH_WARNING',
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
}
