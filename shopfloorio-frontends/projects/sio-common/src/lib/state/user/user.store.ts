import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { UserDto } from 'shared/common/models';
import { UserListFilters } from './user.service';

export interface UsersState extends EntityState<UserDto>, UserListFilters {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'users' })
export class UsersStore extends EntityStore<UsersState> {
  constructor() {
    super();
  }
}
