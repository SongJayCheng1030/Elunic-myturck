import { Test, TestingModule } from '@nestjs/testing';

import { FacadesService } from './facades.service';

describe('FacadesService', () => {
  let service: FacadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacadesService],
    }).compile();

    service = module.get<FacadesService>(FacadesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
