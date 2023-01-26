import { Test, TestingModule } from '@nestjs/testing';

import { GeneralController } from './general.controller';

describe('GeneralController', () => {
  let controller: GeneralController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeneralController],
    }).compile();

    controller = module.get<GeneralController>(GeneralController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
