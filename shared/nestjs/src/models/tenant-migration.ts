import { AuthInfo } from 'shared/common/types';

export interface TenantMigration {
  /**
   * Returns the string of this migration to be used as the
   * reference that the migration has been successfully performed.
   * Thes return value should NEVER change
   *
   * @returns The name or the migration
   */
  getName(): Promise<string>;

  /**
   * Callback function to run this migration. This function is called
   * for every new tenant id which is encountered unless the combination
   * of tenant id and `getName()` is already marked as done
   *
   * @param tenantId The new tenant id to run the migration for
   * @param authInfo The auth info of the requesting user
   */
  up(tenantId: string, authInfo: AuthInfo): Promise<void>;
}
