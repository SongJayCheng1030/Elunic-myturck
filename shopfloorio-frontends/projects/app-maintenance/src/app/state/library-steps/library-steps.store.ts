import { Injectable } from '@angular/core';
import { ActiveState, EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { MaintenanceProcedureLibraryStepDto } from 'shared/common/models';

export interface MntLibraryStepsState
  extends EntityState<MaintenanceProcedureLibraryStepDto>,
    ActiveState {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'library-steps' })
export class MntLibraryStepsStore extends EntityStore<MntLibraryStepsState> {
  constructor() {
    super();
  }
}
