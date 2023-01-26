import { Test, TestingModule } from '@nestjs/testing';

import { KeycloakTenantsService } from './keycloak-tenants.service';

describe('KeycloakTenantsService', () => {
  let service: KeycloakTenantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeycloakTenantsService],
    }).compile();

    service = module.get<KeycloakTenantsService>(KeycloakTenantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
