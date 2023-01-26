import { Test, TestingModule } from '@nestjs/testing';

import { AssetHierarchyService } from './asset-hierarchy.service';

describe('AssetHierarchyService', () => {
  let service: AssetHierarchyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetHierarchyService],
    }).compile();

    service = module.get<AssetHierarchyService>(AssetHierarchyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
