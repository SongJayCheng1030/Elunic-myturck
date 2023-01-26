import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { switchMap } from 'rxjs';
import { UsersState, UsersStore } from './user.store';

@Injectable({ providedIn: 'root' })
export class UsersQuery extends QueryEntity<UsersState> {
  filteredUsers$ = this.select('q').pipe(
    switchMap(q => {
      return typeof q === 'string' && q !== ''
        ? this.selectAll({
            filterBy: user =>
              user.email.includes(q) ||
              user.name.includes(q) ||
              user.firstName.includes(q) ||
              user.lastName.includes(q),
          })
        : this.selectAll();
    }),
  );

  constructor(protected store: UsersStore) {
    super(store);
  }
}
