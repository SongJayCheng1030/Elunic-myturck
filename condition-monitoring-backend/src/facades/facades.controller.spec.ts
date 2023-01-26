import { Test, TestingModule } from '@nestjs/testing';

import { FacadesController } from './facades.controller';

describe('FacadesController', () => {
  let controller: FacadesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacadesController],
    }).compile();

    controller = module.get<FacadesController>(FacadesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
