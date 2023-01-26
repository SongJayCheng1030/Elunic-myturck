import { Test, TestingModule } from '@nestjs/testing';

import { KeycloakUsersService } from './keycloak-users.service';

describe('KeycloakUsersService', () => {
  let service: KeycloakUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeycloakUsersService],
    }).compile();

    service = module.get<KeycloakUsersService>(KeycloakUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
