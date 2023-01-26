import { Test, TestingModule } from '@nestjs/testing';

import { AssetPropertyController } from './asset-property.controller';

describe('AssetProperty Controller', () => {
  let controller: AssetPropertyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetPropertyController],
    }).compile();

    controller = module.get<AssetPropertyController>(AssetPropertyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
