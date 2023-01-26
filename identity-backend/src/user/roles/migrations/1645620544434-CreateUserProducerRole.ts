import { SioRights } from 'shared/nestjs';
import { ShopfloorIoRolePrefix } from 'shared/nestjs/roles/roles';

import { AddRoleMigrationFunc, createRoleFunc, MigrationRoleDto } from './util';

const ROLE: MigrationRoleDto = {
  key: `${ShopfloorIoRolePrefix}user-producer`,
  name: {
    'de-DE': 'Benutzer (Produzent)',
    'en-EN': 'User (producer)',
  },
  description: {
    'en-EN': 'Default Shoplfoor.IO role for assiging reduced rights to platform users.',
    'de-DE': 'Standard Shopfloor.IO Rolle für den eingeschränkten Nutzerzugriff.',
  },
  rights: [
    SioRights.GeneralSystemUser,
    SioRights.UserManagementEditMe,
    SioRights.HubUse,
    SioRights.CondMonUse,
    SioRights.MaintMangrUse,
  ],
};

export const CreateUserProducerRole1645620544434: AddRoleMigrationFunc = createRoleFunc(ROLE);
