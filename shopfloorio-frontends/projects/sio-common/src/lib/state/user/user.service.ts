import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { setLoading } from '@datorama/akita';
import { map, Observable, tap } from 'rxjs';
import { UserDto } from 'shared/common/models';
import { DataResponse } from 'shared/common/response';
import urlJoin from 'url-join';

import { Right, Role, UpdateUserDto, UserNameResolveMap } from '../../models';
import { EnvironmentService } from '../../services';
import { UsersStore } from './user.store';

export interface UserListFilters {
  q?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private readonly userStore: UsersStore,
    private readonly http: HttpClient,
    private readonly environment: EnvironmentService,
  ) {}

  byId$(userId: string): Observable<UserDto> {
    return this.http
      .get<DataResponse<UserDto>>(
        urlJoin(this.environment.userServiceUrl, '/v1/users', `/users/${userId}`),
      )
      .pipe(map(d => d.data));
  }

  listAllRights$(): Observable<Right[]> {
    return this.http
      .get<DataResponse<Right[]>>(
        urlJoin(this.environment.userServiceUrl, '/v1/users', `/roles/rights`),
      )
      .pipe(map(d => d.data));
  }

  getRoleById$(id: string): Observable<Role> {
    return this.http
      .get<DataResponse<Role>>(
        urlJoin(this.environment.userServiceUrl, '/v1/users', `/roles/${id}`),
      )
      .pipe(map(d => d.data));
  }

  createRole$(role: Partial<Role>): Observable<Role> {
    return this.http
      .post<DataResponse<Role>>(
        urlJoin(this.environment.userServiceUrl, '/v1/users', `/roles`),
        role,
      )
      .pipe(map(d => d.data));
  }

  updateRole$(roleId: string, role: Partial<Role>): Observable<Role> {
    return this.http
      .put<DataResponse<Role>>(
        urlJoin(this.environment.userServiceUrl, '/v1/users', `/roles/${roleId}`),
        role,
      )
      .pipe(map(d => d.data));
  }

  deleteRole$(roleId: string): Observable<void> {
    return this.http
      .delete<object>(urlJoin(this.environment.userServiceUrl, '/v1/users', `/roles/${roleId}`))
      .pipe(map(_ => {}));
  }

  listAllRoles$(): Observable<Role[]> {
    return this.http
      .get<DataResponse<Role[]>>(urlJoin(this.environment.userServiceUrl, '/v1/users', `/roles`))
      .pipe(map(r => r.data));
  }

  updateUser$(userId: string, dto: UpdateUserDto): Observable<UserDto> {
    return this.http
      .put<DataResponse<UserDto>>(
        urlJoin(this.environment.userServiceUrl, '/v1/users', `/users/${userId}`),
        dto,
      )
      .pipe(map(d => d.data));
  }

  createUser$(dto: UpdateUserDto): Observable<UserDto> {
    return this.http
      .post<DataResponse<UserDto>>(
        urlJoin(this.environment.userServiceUrl, '/v1/users', `/users`),
        dto,
      )
      .pipe(map(d => d.data));
  }

  deleteUser$(userId: string): Observable<void> {
    return this.http
      .delete<DataResponse<UserDto>>(
        urlJoin(this.environment.userServiceUrl, '/v1/users', `/users/${userId}`),
      )
      .pipe(map(_ => {}));
  }

  resolveNames$(userIds: string[]): Observable<UserNameResolveMap> {
    return this.http
      .get<DataResponse<UserNameResolveMap>>(
        urlJoin(this.environment.userServiceUrl, '/v1/users', `/names`),
        {
          params: {
            ids: userIds.join(','),
            map: '1',
          },
        },
      )
      .pipe(map(resp => resp.data));
  }

  setFilters(userFilters: UserListFilters): void {
    this.userStore.update(userFilters);
  }

  loadUsers$(): Observable<UserDto[]> {
    return this.http
      .get<DataResponse<UserDto[]>>(urlJoin(this.environment.userServiceUrl, '/v1/users', `/users`))
      .pipe(
        setLoading(this.userStore),
        map(res => res.data),
        tap(users => this.userStore.set(users)),
      );
  }
}
