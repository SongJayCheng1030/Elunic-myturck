import { Test, TestingModule } from '@nestjs/testing';

import { KeycloakRpcService } from './keycloak-rpc.service';

describe('KeycloakRpcService', () => {
  let service: KeycloakRpcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeycloakRpcService],
    }).compile();

    service = module.get<KeycloakRpcService>(KeycloakRpcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
