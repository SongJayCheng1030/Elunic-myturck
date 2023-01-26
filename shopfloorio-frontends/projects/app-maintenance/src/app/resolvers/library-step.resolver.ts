import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { take, tap } from 'rxjs';
import { MaintenanceProcedureLibraryStepDto } from 'shared/common/models';
import { MntLibraryStepsQuery } from '../state/library-steps/libarary-steps.query';
import { MntLibraryStepsService } from '../state/library-steps/library-steps.service';

@Injectable({ providedIn: 'root' })
export class MntLibraryStepResolver
  implements Resolve<MaintenanceProcedureLibraryStepDto | undefined>
{
  constructor(
    private router: Router,
    private libraryStepsService: MntLibraryStepsService,
    private libraryStepsQuery: MntLibraryStepsQuery,
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id') as string;

    return this.libraryStepsQuery.selectEntity(id).pipe(
      take(1),
      tap(step =>
        step ? this.libraryStepsService.setActiveLibraryStep(id) : this.router.navigate(['/']),
      ),
    );
  }
}
