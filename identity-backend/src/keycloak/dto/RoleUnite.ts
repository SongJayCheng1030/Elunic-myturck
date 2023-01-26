import { MultilangValue } from 'shared/common/models';

export interface RoleUnite {
  id: string;
  keycloakId: string;
  /**
   * The name of the role, here treated as `key`. In Keycloak that is
   * the display name
   */
  key: string;

  /**
   * A human readable name saved as attribute in Keycloak
   */
  name: MultilangValue;
  description: MultilangValue;
  rights: RightUnite[];
  createdAt: string | null;
  updatedAt: string | null;
  isDefault: boolean;
}

export interface RightUnite {
  id: string;
  keycloakId: string;
  key: string;
  description: MultilangValue;
}
