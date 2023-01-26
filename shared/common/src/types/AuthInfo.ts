export interface AuthInfo {
  /**
   * The UUID of the current user
   */
  id: string;

  /**
   * The tenant name of the tenant requested by the user
   */
  tenantId: string;

  /**
   * Time in msec (`Date.now()`) when the user logged into the system
   * or more precisely when the JWT has been created
   */
  iat: number;

  /**
   * The name of the actual user (e.g. lischen.meier or an e-mail address
   * if set as username)
   */
  name: string;

  /**
   * Expiration time of the token in msec
   */
  exp?: number;

  /**
   * Scopes for an API token or null/undefined/empty otherwise
   */
  scopes?: string[];

  /**
   * Preffered user language key
   */
  userLang: string;

  /**
   * User can potentially switch to multiple tenants
   */
  isMultitenant: boolean;

  /**
   * Contains the raw JWT token, used by the requesting user
   */
  token: string;

  /**
   * Contains the user roles
   */
  roles?: string[];
}
