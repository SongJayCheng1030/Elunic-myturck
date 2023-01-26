import { Test, TestingModule } from '@nestjs/testing';

import { GrafanaBuildingsetController } from './grafana-buildingset.controller';

describe('GrafanaBuildingsetController', () => {
  let controller: GrafanaBuildingsetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrafanaBuildingsetController],
    }).compile();

    controller = module.get<GrafanaBuildingsetController>(GrafanaBuildingsetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
