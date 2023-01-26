import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { MaintenanceExecutionDto } from 'shared/common/models';

import { MntExecutionService } from '../services';

@Injectable({ providedIn: 'root' })
export class ExecutionResolver implements Resolve<MaintenanceExecutionDto | null> {
  constructor(private router: Router, private executionService: MntExecutionService) {}

  async resolve(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id') as string;
    const execution = await this.executionService.getExecution(id).catch(() => null);
    if (!execution) {
      await this.router.navigate(['/']);
      return null;
    }
    return execution;
  }
}
