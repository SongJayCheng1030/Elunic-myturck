import { Test, TestingModule } from '@nestjs/testing';

import { StaticSettingsService } from './static-settings.service';

describe('StaticSettingsService', () => {
  let service: StaticSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaticSettingsService],
    }).compile();

    service = module.get<StaticSettingsService>(StaticSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
