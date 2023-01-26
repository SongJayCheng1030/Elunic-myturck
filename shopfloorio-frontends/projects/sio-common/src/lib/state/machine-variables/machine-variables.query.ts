import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { MachineVariablesState, MachineVariablesStore } from './machine-variables.store';

@Injectable({ providedIn: 'root' })
export class MachineVariablesQuery extends QueryEntity<MachineVariablesState> {
  constructor(protected store: MachineVariablesStore) {
    super(store);
  }
}
