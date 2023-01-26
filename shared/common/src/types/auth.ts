export interface AuthInfoPossiblyNoTenant {
  /**
   * The UUID of the current user
   */
  id: string;

  /**
   * The tenant id (UUID) of the current user. The value is either
   * `null` if the user does not is signed in into a tenant or the
   * UUID of the current tenant.
   */
  tenantId: string | null;

  /**
   * Time in seconds when the user logged into the system
   * or more precisely when the JWT has been created
   */
  iat: number;

  /**
   * Expiration time of the token in seconds
   */
  exp: number;

  /**
   * The name of the actual user (e.g. lischen.meier or an e-mail address
   * if set as username)
   */
  name: string;

  /**
   * E-Mail address of the current user
   */
  email: string | null;

  /**
   * Preferred user language key
   */
  preferredLanguage: string | null;

  /**
   * Is set to `true` iff the user has access to all tenants in the
   * system
   */
  isMultiTenantAdmin: boolean;

  /**
   * Contains the raw JWT token, used by the requesting user
   */
  token: string;

  /**
   * Contains the rights assigned to the user. Always from `SioRights` array
   */
  rights: string[];

  /**
   * A list of all tenants assigned to the current user.
   */
  tenants: string[];
}

export interface AuthInfo extends AuthInfoPossiblyNoTenant {
  tenantId: string;
}
