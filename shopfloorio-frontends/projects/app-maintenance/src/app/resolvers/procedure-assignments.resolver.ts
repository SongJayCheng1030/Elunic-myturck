import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { MaintenanceAssignmentDto } from 'shared/common/models';

import { MntProcedureService } from '../services';

@Injectable({ providedIn: 'root' })
export class ProcedureAssignmentsResolver implements Resolve<MaintenanceAssignmentDto[] | null> {
  constructor(private router: Router, private procedureService: MntProcedureService) {}

  async resolve(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id') as string;
    const assignments = await this.procedureService.getProcedureAssignments(id).catch(() => null);
    if (!assignments) {
      await this.router.navigate(['/']);
      return null;
    }
    return assignments;
  }
}
