import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EnvironmentService } from '@sio/common';
import { ToastrService } from 'ngx-toastr';
import { catchError, firstValueFrom, map } from 'rxjs';
import { MachineVariableDto } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class MntMachineVariablesService extends ApiBaseService {
  constructor(
    private readonly environment: EnvironmentService,
    private http: HttpClient,
    toastrService: ToastrService,
    translate: TranslateService,
  ) {
    super(toastrService, translate);
  }

  listMachineVariables(): Promise<MachineVariableDto[]> {
    const url = urlJoin(this.environment.conditionMonitoringServiceUrl, 'v1/machine-variables');
    return firstValueFrom(
      this.http.get<DataResponse<MachineVariableDto[]>>(url, {}).pipe(
        map(res => res.data),
        catchError(error => this.handleError(error)),
      ),
    );
  }
}
