import { Pipe, PipeTransform } from '@angular/core';
import { get, has, set } from 'lodash';
import { catchError, map, Observable, of } from 'rxjs';
import { ActorNameResult } from 'shared/common/models';

import { UserNameResolveMap } from '../models';
import { UserService } from '../state';

function setUserNamesLocal(newMap: UserNameResolveMap): void {
  if (!has(window, 'UserNameResolveMap')) {
    set(window, 'UserNameResolveMap', {});
  }
  const map = get(window, 'UserNameResolveMap');
  Object.assign(map, newMap);
}

function getUserNameLocal(id: string): ActorNameResult | null {
  const map = get(window, 'UserNameResolveMap') || {};
  if (typeof map[id] !== 'undefined') {
    return map[id];
  }
  return null;
}

@Pipe({
  name: 'username',
})
export class UsernamePipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  transform(value: string | null | undefined) {
    return UsernamePipe.do(value || '', this.userService);
  }

  static do(userId: string, userService: UserService): Observable<string> {
    if (!userId) {
      return of('N/A');
    }

    const exists = getUserNameLocal(userId);
    if (exists) {
      return of(UsernamePipe.formatUserNameToDisplayValue(exists));
    }

    return userService.resolveNames$([userId]).pipe(
      catchError(_ => of(null)),
      map(u => {
        if (!u) {
          return `Unknown (${userId.substring(0, 14)})`;
        }

        setUserNamesLocal(u);

        if (typeof u[userId] !== 'undefined') {
          return UsernamePipe.formatUserNameToDisplayValue(u[userId]);
        }

        return `Unknown (${userId.substring(0, 14)})`;
      }),
    );
  }

  private static formatUserNameToDisplayValue(usr: ActorNameResult): string {
    return usr.name;
  }
}
