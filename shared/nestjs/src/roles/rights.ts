// All Shopfloor.IO right identifiers start with this prefix
export const ShopfloorIoRightPrefix = 'urn:sio:right:';

export type ShopfloorRight = string;

export const SioRights = {
  GeneralSystemUser: `${ShopfloorIoRightPrefix}general:user`,

  TenantManagementUse: `${ShopfloorIoRightPrefix}tenant:use`,
  TenantManagementCreate: `${ShopfloorIoRightPrefix}tenant:create`,

  UserManagementUse: `${ShopfloorIoRightPrefix}user:use`,
  UserManagementCreate: `${ShopfloorIoRightPrefix}user:create`,
  UserManagementDelete: `${ShopfloorIoRightPrefix}user:delete`,
  UserManagementEdit: `${ShopfloorIoRightPrefix}user:edit`,
  UserManagementEditMe: `${ShopfloorIoRightPrefix}user:edit:self`,
  UserManagementAssignRoles: `${ShopfloorIoRightPrefix}user:roles`,

  AssetMgmtUse: `${ShopfloorIoRightPrefix}asset:use`,
  AssetMgmtEditHierarchy: `${ShopfloorIoRightPrefix}asset:hierarchy`,
  AssetMgmtEditTypes: `${ShopfloorIoRightPrefix}asset:type`,
  AssetMgmtCreateAsset: `${ShopfloorIoRightPrefix}asset:asset:create`,
  AssetMgmtEditAsset: `${ShopfloorIoRightPrefix}asset:asset:edit`,
  AssetMgmtDeleteAsset: `${ShopfloorIoRightPrefix}asset:asset:delete`,
  AssetMgmtEditAssetOwn: `${ShopfloorIoRightPrefix}asset:asset:edit:self`,
  AssetMgmtDeleteAssetOwn: `${ShopfloorIoRightPrefix}asset:asset:delete:self`,

  HubUse: `${ShopfloorIoRightPrefix}hub:use`,
  HubEdit: `${ShopfloorIoRightPrefix}hub:edit`,

  CondMonUse: `${ShopfloorIoRightPrefix}cm:use`,
  CondMonEdit: `${ShopfloorIoRightPrefix}cm:edit`,

  MaintMangrUse: `${ShopfloorIoRightPrefix}mm:use`,

  GrafanaUse: `${ShopfloorIoRightPrefix}grafana:use`,
};

export const RightDescriptions = {
  [SioRights.GeneralSystemUser]: {
    'en-EN':
      'Default right for a user of the Shopfloor application. Assigned to every user by default.',
    'de-DE':
      'Standardrecht für einen Benutzer der Shopfloor-Anwendung. Automatisch jedem Nutzer zugewiesen.',
  },
  [SioRights.TenantManagementUse]: {
    'en-EN': 'Role "TenantManagementUse"',
    'de-DE': 'Rolle "TenantManagementUse"',
  },
  [SioRights.TenantManagementCreate]: {
    'en-EN': 'Role "TenantManagementCreate"',
    'de-DE': 'Rolle "TenantManagementCreate"',
  },
  [SioRights.UserManagementUse]: {
    'en-EN': 'Role "UserManagementUse"',
    'de-DE': 'Rolle "UserManagementUse"',
  },
  [SioRights.UserManagementCreate]: {
    'en-EN': 'Role "UserManagementCreate"',
    'de-DE': 'Rolle "UserManagementCreate"',
  },
  [SioRights.UserManagementDelete]: {
    'en-EN': 'Role "UserManagementDelete"',
    'de-DE': 'Rolle "UserManagementDelete"',
  },
  [SioRights.UserManagementEdit]: {
    'en-EN': 'Role "UserManagementEdit"',
    'de-DE': 'Rolle "UserManagementEdit"',
  },
  [SioRights.UserManagementEditMe]: {
    'en-EN': 'Role "UserManagementEditMe"',
    'de-DE': 'Rolle "UserManagementEditMe"',
  },
  [SioRights.UserManagementAssignRoles]: {
    'en-EN': 'Role "UserManagementAssignRoles"',
    'de-DE': 'Rolle "UserManagementAssignRoles"',
  },
  [SioRights.AssetMgmtUse]: {
    'en-EN': 'Role "AssetMgmtUse"',
    'de-DE': 'Rolle "AssetMgmtUse"',
  },
  [SioRights.AssetMgmtEditHierarchy]: {
    'en-EN': 'Role "AssetMgmtEditHierarchy"',
    'de-DE': 'Rolle "AssetMgmtEditHierarchy"',
  },
  [SioRights.AssetMgmtEditTypes]: {
    'en-EN': 'Role "AssetMgmtEditTypes"',
    'de-DE': 'Rolle "AssetMgmtEditTypes"',
  },
  [SioRights.AssetMgmtCreateAsset]: {
    'en-EN': 'Role "AssetMgmtCreateAsset"',
    'de-DE': 'Rolle "AssetMgmtCreateAsset"',
  },
  [SioRights.AssetMgmtEditAsset]: {
    'en-EN': 'Role "AssetMgmtEditAsset"',
    'de-DE': 'Rolle "AssetMgmtEditAsset"',
  },
  [SioRights.AssetMgmtDeleteAsset]: {
    'en-EN': 'Role "AssetMgmtDeleteAsset"',
    'de-DE': 'Rolle "AssetMgmtDeleteAsset"',
  },
  [SioRights.AssetMgmtEditAssetOwn]: {
    'en-EN': 'Role "AssetMgmtEditAssetOwn"',
    'de-DE': 'Rolle "AssetMgmtEditAssetOwn"',
  },
  [SioRights.AssetMgmtDeleteAssetOwn]: {
    'en-EN': 'Role "AssetMgmtDeleteAssetOwn"',
    'de-DE': 'Rolle "AssetMgmtDeleteAssetOwn"',
  },
  [SioRights.HubUse]: {
    'en-EN': 'Role "HubUse"',
    'de-DE': 'Rolle "HubUse"',
  },
  [SioRights.HubEdit]: {
    'en-EN': 'Role "HubEdit"',
    'de-DE': 'Rolle "HubEdit"',
  },
  [SioRights.CondMonUse]: {
    'en-EN': 'Role "CondMonUse"',
    'de-DE': 'Rolle "CondMonUse"',
  },
  [SioRights.CondMonEdit]: {
    'en-EN': 'Role "CondMonEdit"',
    'de-DE': 'Rolle "CondMonEdit"',
  },
  [SioRights.MaintMangrUse]: {
    'en-EN': 'Role "MaintMangrUse"',
    'de-DE': 'Rolle "MaintMangrUse"',
  },
  [SioRights.GrafanaUse]: {
    'en-EN': 'Role "GrafanaUse"',
    'de-DE': 'Rolle "GrafanaUse"',
  },
};

export const UnknownRightDescription = {
  'en-EN': 'Unknown right; description is not available.',
  'de-DE': 'Unbekanntes Recht; eine Beschreibung ist nicht verfügbar.',
};
