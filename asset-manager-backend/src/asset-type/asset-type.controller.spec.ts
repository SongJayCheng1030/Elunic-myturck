import { Test, TestingModule } from '@nestjs/testing';

import { AssetTypeController } from './asset-type.controller';

describe('AssetType Controller', () => {
  let controller: AssetTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetTypeController],
    }).compile();

    controller = module.get<AssetTypeController>(AssetTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
