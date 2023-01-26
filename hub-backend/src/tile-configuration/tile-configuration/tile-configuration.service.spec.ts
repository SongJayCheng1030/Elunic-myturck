import { Test, TestingModule } from '@nestjs/testing';

import { TileConfigurationService } from './tile-configuration.service';

describe('TileConfigurationService', () => {
  let service: TileConfigurationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TileConfigurationService],
    }).compile();

    service = module.get<TileConfigurationService>(TileConfigurationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
