export interface User {
  /**
   * ID of the user
   */
  id: string;

  /**
   * The id (UUID) of the current tenant the user is assigned
   * to or `null` if the user is not yet assigned to a tenant
   *
   * Important: It might be that this value is set to null. The
   * user can then not open anything and should be redirect to
   * the tenant frontend to be able to jump into a tenant
   */
  tenantId?: string | null;

  /**
   * The name of the user
   */
  name: string;

  /**
   * The e mail address of the user
   */
  email: string;

  /**
   * The user's first name, not always available
   */
  firstName: string | null;

  /**
   * The user's last name, not always available
   */
  lastName: string | null;

  /**
   * The file id of the user's avatar image if set.
   * Otherwise set to `null`
   */
  imageId: string | null;

  /**
   * The preferredLanguage language of the user or `null` if not
   * defined (yet)
   */
  preferredLanguage: string | null;

  /**
   * A list of roles of the current user
   */
  roles: {
    id: string;
    key: string;
    isDefault: boolean;
  }[];
}

export const UpdateableUserProperties = ['tenantId', 'firstName', 'lastName', 'name', 'email'];
