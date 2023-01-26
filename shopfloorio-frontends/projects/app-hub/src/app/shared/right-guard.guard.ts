import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { SharedSessionService } from '@sio/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RightGuard implements CanActivate {
  constructor(private apiService: SharedSessionService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!route.data || !route.data.right) return true;

    // TODO: FIXEME: implement
    return true;

    // return this.apiService.user__Rights.then(rights => {
    //   if (!rights || !rights.global) return false;

    //   return rights.global[route.data.right];
    // })
  }
}
