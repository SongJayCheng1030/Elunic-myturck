import { Test, TestingModule } from '@nestjs/testing';

import { GrafanaBuildingsetTileController } from './grafana-buildingset-tile.controller';

describe('GrafanaBuildingsetTileController', () => {
  let controller: GrafanaBuildingsetTileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrafanaBuildingsetTileController],
    }).compile();

    controller = module.get<GrafanaBuildingsetTileController>(GrafanaBuildingsetTileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
