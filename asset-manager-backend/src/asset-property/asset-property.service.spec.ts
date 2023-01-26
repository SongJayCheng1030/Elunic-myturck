import { Test, TestingModule } from '@nestjs/testing';

import { AssetPropertyService } from './asset-property.service';

describe('AssetPropertyService', () => {
  let service: AssetPropertyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetPropertyService],
    }).compile();

    service = module.get<AssetPropertyService>(AssetPropertyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
