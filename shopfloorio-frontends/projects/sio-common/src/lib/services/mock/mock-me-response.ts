import { DataResponse } from 'shared/common/response';

import { UserMeDto } from '../../models';

export const MockUsersMeResponse: DataResponse<UserMeDto> = {
  data: {
    id: '44fc23bc-b04c-4b7c-97ad-c8e0ba720ce5',
    name: 'Test Test',
    email: 'test@test.de',
    firstName: 'Test',
    lastName: 'Test',
    imageId: 'a7f9a03b-08a1-486c-9579-b495429acd51',
    tenantId: '0bfd22e4-88c5-4f73-bcdb-6bb4ae9aa7ed',
    preferredLanguage: null,
    roles: [
      {
        id: '2ecbd0ca-4bfc-53cc-d95d-d25f8599ce2f',
        key: 'urn:sio:role:super-admin',
        isDefault: true,
        name: {
          'de-DE': 'Super-Admin (Maschinenbauer)',
          'en-EN': 'Super admin (machine builder)',
        },
      },
    ],
    iat: 1646936018,
    exp: 1646936318,
    rights: [
      'urn:sio:right:ad:use',
      'urn:sio:right:user:roles',
      'urn:sio:right:mm:use',
      'urn:sio:right:user:delete',
      'urn:sio:right:tenant:use',
      'urn:sio:right:cm:edit',
      'urn:sio:right:asset:hierarchy',
      'urn:sio:right:tenant:create',
      'urn:sio:right:asset:type',
      'urn:sio:right:general:user',
      'urn:sio:right:cm:use',
      'urn:sio:right:asset:asset:delete:self',
      'urn:sio:right:user:edit',
      'urn:sio:right:asset:asset:create',
      'urn:sio:right:user:use',
      'urn:sio:right:asset:use',
      'urn:sio:right:grafana:use',
      'urn:sio:right:asset:asset:edit:self',
      'urn:sio:right:hub:use',
      'urn:sio:right:hub:edit',
      'urn:sio:right:asset:asset:edit',
      'urn:sio:right:user:create',
      'urn:sio:right:user:edit:self',
      'urn:sio:right:asset:asset:delete',
    ],
    isMultiTenantAdmin: true,
    tenants: [
      '0bfd22e4-88c5-4f73-bcdb-6bb4ae9aa7ed',
      '577fac08-51fa-4f5f-abe3-5f4b23765b73',
      '6c897ced-74e8-4af5-8e3b-eed8c1c76496',
    ],
  },
  meta: {},
};
