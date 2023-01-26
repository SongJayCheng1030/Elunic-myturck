import { Test, TestingModule } from '@nestjs/testing';

import { AssetTypeService } from './asset-type.service';

describe('AssetTypeService', () => {
  let service: AssetTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetTypeService],
    }).compile();

    service = module.get<AssetTypeService>(AssetTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
