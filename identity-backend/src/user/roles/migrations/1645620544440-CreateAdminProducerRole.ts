import { SioRights } from 'shared/nestjs';
import { ShopfloorIoRolePrefix } from 'shared/nestjs/roles/roles';

import { AddRoleMigrationFunc, createRoleFunc, MigrationRoleDto } from './util';

const ROLE: MigrationRoleDto = {
  key: `${ShopfloorIoRolePrefix}admin-producer`,
  name: {
    'de-DE': 'Admin (Produzent)',
    'en-EN': 'Admin (producer)',
  },
  description: {
    'en-EN': 'Default Shoplfoor.IO role for an admin user of a producer.',
    'de-DE': 'Standard Shopfloor.IO Rolle für einen Produzenten-Administrator.',
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
    SioRights.AssetMgmtCreateAsset,
    SioRights.AssetMgmtEditAsset,
    SioRights.AssetMgmtDeleteAsset,
    SioRights.AssetMgmtEditAssetOwn,
    SioRights.AssetMgmtDeleteAssetOwn,
    SioRights.HubUse,
    SioRights.CondMonUse,
    SioRights.MaintMangrUse,
  ],
};

export const CreateAdminProducerRole1645620544440: AddRoleMigrationFunc = createRoleFunc(ROLE);
