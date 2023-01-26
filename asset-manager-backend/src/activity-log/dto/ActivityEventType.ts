import { MultilangValue } from 'shared/common/models';

/**
 * Please consider also the database migrations if you change the
 * values of this enum in any kind! See `src/migraions/` folder!
 */
export enum ActivityEventType {
  /**
   * The asset has been changed, not defined any futher what
   * actually changed. Just a general action
   */
  GENERAL_CHANGE = 'GENERAL_CHANGE',

  /**
   * The asset has been created
   */
  CREATED = 'CREATED',

  /**
   * A field inside an asset has been updated
   */
  FIELD_UPDATED = 'FIELD_UPDATED',

  /**
   * The same as FIELD_UPDATED but for fields which are
   * collections (i.e. arrays) and therefore the following
   * special meanings are defined:
   *  - `oldValue === null && newValue !== null` - an item has been added (`newValue`)
   *  - `oldValue !== null && newValue !== null` - an item has been modified
   *  - `oldValue !== null && newValue === null` - an item has been removed (`oldValue`)
   */
  COLLECTION_UPDATED = 'COLLECTION_UPDATED',

  /**
   * A property of an asset has been update
   */
  PROPERTY_UPDATED = 'PROPERTY_UPDATED',

  /**
   * The asset type has been updated
   */
  ASSET_TYPE_UPDATED = 'ASSET_TYPE_UPDATED',

  /**
   * The property has been soft-deleted
   */
  SOFT_DELETED = 'SOFT_DELETED',
}

export type ActivityValueType =
  | string
  | number
  | boolean
  | null
  | { [key: string]: ActivityValueType }
  | MultilangValue
  | undefined;
