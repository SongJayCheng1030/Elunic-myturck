import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentService } from '@sio/common';
import { map, Observable, tap } from 'rxjs';
import { CreateMachineVariableDto, MachineVariableDto } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';
import { MachineVariablesStore } from './machine-variables.store';

@Injectable({ providedIn: 'root' })
export class MachineVariablesService {
  constructor(
    private store: MachineVariablesStore,
    private httpClient: HttpClient,
    private environment: EnvironmentService,
  ) {}

  createMachineVariable(dto: CreateMachineVariableDto): Observable<MachineVariableDto> {
    const url = urlJoin(this.environment.conditionMonitoringServiceUrl, '/v1/machine-variables');
    return this.httpClient
      .post<MachineVariableDto>(url, dto)
      .pipe(tap(machineVariable => this.store.add(machineVariable)));
  }

  updateMachineVariable(dto: CreateMachineVariableDto, id: string): Observable<MachineVariableDto> {
    const url = urlJoin(
      this.environment.conditionMonitoringServiceUrl,
      `/v1/machine-variables/${id}`,
    );
    return this.httpClient
      .put<MachineVariableDto>(url, dto)
      .pipe(tap(machineVariable => this.store.replace(machineVariable.id, machineVariable)));
  }

  deleteLibraryStep(id: string) {
    const url = urlJoin(
      this.environment.conditionMonitoringServiceUrl,
      `/v1/machine-variables/${id}`,
    );
    return this.httpClient.delete(url).pipe(tap(() => this.store.remove(id)));
  }

  getAllMachineVariables(): Observable<MachineVariableDto[]> {
    const url = urlJoin(this.environment.conditionMonitoringServiceUrl, '/v1/machine-variables');
    return this.httpClient.get<DataResponse<MachineVariableDto[]>>(url).pipe(
      map(res => res.data),
      tap(machineVariables => this.store.set(machineVariables)),
    );
  }
}
