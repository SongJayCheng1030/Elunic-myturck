import { Test, TestingModule } from '@nestjs/testing';

import { SharedAssetService } from './shared-asset.service';

describe('SharedAssetService', () => {
  let service: SharedAssetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedAssetService],
    }).compile();

    service = module.get<SharedAssetService>(SharedAssetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
