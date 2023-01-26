import { Injectable } from '@angular/core';
import { from, Observable, tap } from 'rxjs';
import {
  CreateMaintenanceProcedureLibraryStepDto,
  MaintenanceProcedureLibraryStepDto,
  UpdateMaintenanceProcedureLibraryStepDto,
} from 'shared/common/models';
import { MntStepLibraryService } from '../../services';
import { MntLibraryStepsStore } from './library-steps.store';

@Injectable({ providedIn: 'root' })
export class MntLibraryStepsService {
  constructor(
    private stepLibraryDataService: MntStepLibraryService,
    private store: MntLibraryStepsStore,
  ) {}

  createLibraryStep(
    dto: CreateMaintenanceProcedureLibraryStepDto,
  ): Observable<MaintenanceProcedureLibraryStepDto> {
    return from(this.stepLibraryDataService.createLibraryStep(dto)).pipe(
      tap(step => this.store.add(step)),
    );
  }

  deleteLibraryStep(id: string) {
    return from(this.stepLibraryDataService.deleteLibraryStep(id)).pipe(
      tap(() => this.store.remove(id)),
    );
  }

  getAllLibrarySteps(): Observable<MaintenanceProcedureLibraryStepDto[]> {
    return from(this.stepLibraryDataService.getLibrarySteps()).pipe(
      tap(steps => this.store.set(steps)),
    );
  }

  setActiveLibraryStep(id: string): void {
    this.store.setActive(id);
  }

  updateOne(id: string, dto: UpdateMaintenanceProcedureLibraryStepDto) {
    return from(this.stepLibraryDataService.updateLibraryStep(id, dto)).pipe(
      tap(step => this.store.upsert(id, step)),
    );
  }
}
