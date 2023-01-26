import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { MaintenanceProcedureDto } from 'shared/common/models';

import { MntProcedureService } from '../services';

@Injectable({ providedIn: 'root' })
export class ProcedureResolver implements Resolve<MaintenanceProcedureDto | null> {
  constructor(private router: Router, private procedureService: MntProcedureService) {}

  async resolve(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id') as string;
    const procedure = await this.procedureService.getProcedure(id).catch(() => null);
    if (!procedure) {
      await this.router.navigate(['/']);
      return null;
    }
    return procedure;
  }
}
