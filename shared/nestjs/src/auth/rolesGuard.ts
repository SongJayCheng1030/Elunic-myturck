import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/** Roles annotation to restrict controller-endpoints to certain user roles
 * @param roles Array of allowed roles
 *
 * `@Roles('/SF/asset-manager/admin')`
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * Roles Guard, to be configured as global guard.
 *
 * Verifies if roles given by `@Roles()` annotation do exist in the user auth `request.auth.roles`.
 *
 * Case-insensitive role check by name / No roles given for a route means access is always granted.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const authInfo = request.auth;
    return this.matchRoles(roles, authInfo?.roles || []);
  }

  matchRoles(guardingRoles: string[], userRoles: string[]): boolean {
    // no role required => canActivate=TRUE
    if (!guardingRoles || guardingRoles.length === 0) {
      return true;
    }
    // no user-role => canActivate=FALSE
    if (!userRoles || userRoles.length === 0) {
      return false;
    }
    // case-insensitive, one-match
    const userRolesLC = userRoles.map(ug => ug.toLowerCase());
    const guardingRolesLC = guardingRoles.map(gg => gg.toLowerCase());
    for (let i = 0; i < guardingRolesLC.length; i++) {
      if (userRolesLC.includes(guardingRolesLC[i])) {
        // user has at least one role that is in the annotation
        // => canActivate=TRUE
        return true;
      }
    }
    // any other case => canActivate=FALSE
    return false;
  }
}
