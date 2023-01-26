import { Test, TestingModule } from '@nestjs/testing';

import { AssetHierarchyController } from './asset-hierarchy.controller';

describe('AssetHierarchy Controller', () => {
  let controller: AssetHierarchyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetHierarchyController],
    }).compile();

    controller = module.get<AssetHierarchyController>(AssetHierarchyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
