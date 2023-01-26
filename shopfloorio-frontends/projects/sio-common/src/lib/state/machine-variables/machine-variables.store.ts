import { Injectable } from '@angular/core';
import { ActiveState, EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { MachineVariableDto } from 'shared/common/models';

export interface MachineVariablesState extends EntityState<MachineVariableDto>, ActiveState {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'machine-variables' })
export class MachineVariablesStore extends EntityStore<MachineVariablesState> {
  constructor() {
    super();
  }
}
