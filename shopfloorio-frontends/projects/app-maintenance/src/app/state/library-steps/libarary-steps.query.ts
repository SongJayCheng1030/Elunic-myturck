import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { MntLibraryStepsState, MntLibraryStepsStore } from './library-steps.store';

@Injectable({ providedIn: 'root' })
export class MntLibraryStepsQuery extends QueryEntity<MntLibraryStepsState> {
  constructor(protected store: MntLibraryStepsStore) {
    super(store);
  }
}
