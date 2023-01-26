import { SioRights } from 'shared/nestjs';
import { ShopfloorIoRolePrefix } from 'shared/nestjs/roles/roles';

import { AddRoleMigrationFunc, createRoleFunc, MigrationRoleDto } from './util';

const ROLE: MigrationRoleDto = {
  key: `${ShopfloorIoRolePrefix}super-admin`,
  name: {
    'de-DE': 'Super-Admin (Maschinenbauer)',
    'en-EN': 'Super admin (machine builder)',
  },
  description: {
    'en-EN': 'Default Shoplfoor.IO super admin role with all available privileges.',
    'de-DE': 'Standard Shopfloor.IO Rolle für Super-Admin mit allen verfügbaren Berechtigungen.',
  },
  rights: [
    SioRights.GeneralSystemUser,
    SioRights.TenantManagementUse,
    SioRights.TenantManagementCreate,
    SioRights.UserManagementUse,
    SioRights.UserManagementCreate,
    SioRights.UserManagementDelete,
    SioRights.UserManagementEdit,
    SioRights.UserManagementEditMe,
    SioRights.UserManagementAssignRoles,
    SioRights.AssetMgmtUse,
    SioRights.AssetMgmtEditHierarchy,
    SioRights.AssetMgmtEditTypes,
    SioRights.AssetMgmtCreateAsset,
    SioRights.AssetMgmtEditAsset,
    SioRights.AssetMgmtDeleteAsset,
    SioRights.AssetMgmtEditAssetOwn,
    SioRights.AssetMgmtDeleteAssetOwn,
    SioRights.HubUse,
    SioRights.HubEdit,
    SioRights.CondMonUse,
    SioRights.CondMonEdit,
    SioRights.MaintMangrUse,
    SioRights.GrafanaUse,
  ],
};

export const CreateSuperAdminRole1645620544445: AddRoleMigrationFunc = createRoleFunc(ROLE);
