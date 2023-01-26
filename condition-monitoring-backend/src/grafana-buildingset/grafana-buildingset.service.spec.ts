import { Test, TestingModule } from '@nestjs/testing';

import { GrafanaBuildingsetService } from './grafana-buildingset.service';

describe('GrafanaBuildingsetService', () => {
  let service: GrafanaBuildingsetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrafanaBuildingsetService],
    }).compile();

    service = module.get<GrafanaBuildingsetService>(GrafanaBuildingsetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
