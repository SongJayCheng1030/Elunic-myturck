import { Test, TestingModule } from '@nestjs/testing';

import { KeycloakRolesService } from './keycloak-roles.service';

describe('KeycloakRolesService', () => {
  let service: KeycloakRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeycloakRolesService],
    }).compile();

    service = module.get<KeycloakRolesService>(KeycloakRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
