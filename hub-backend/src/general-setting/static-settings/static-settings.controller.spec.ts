import { Test, TestingModule } from '@nestjs/testing';

import { StaticSettingsController } from './static-settings.controller';

describe('StaticSettingsController', () => {
  let controller: StaticSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaticSettingsController],
    }).compile();

    controller = module.get<StaticSettingsController>(StaticSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
