import { Test, TestingModule } from '@nestjs/testing';

import { TileConfigurationController } from './tile-configuration.controller';

describe('TileConfigurationController', () => {
  let controller: TileConfigurationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TileConfigurationController],
    }).compile();

    controller = module.get<TileConfigurationController>(TileConfigurationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
