import * as Joi from 'joi';

// All Shopfloor.IO role identifiers start with this prefix
export const ShopfloorIoRolePrefix = 'urn:sio:role:';

// "Custom" tenant role
export const ShopfloorIoCustomRolePrefix = 'urn:sio:tenantrole:';

export function getShopfloorIoTenantRolePrefix(tenantId: string, postfix = ''): string {
  Joi.assert(tenantId, Joi.string().uuid().required());
  return `${ShopfloorIoCustomRolePrefix}${tenantId}:${postfix}`;
}

export const UnknownRoleName = {
  'en-EN': 'Unknown default role',
  'de-DE': 'Unbekannte Standard-Rolle',
};
