export interface TenantUnite {
  /**
   * Keycloaks internal id for this "group" aka tenant
   */
  keycloakId: string;

  /**
   * The actual tenant id used in the service
   */
  tenantId: string;
}
