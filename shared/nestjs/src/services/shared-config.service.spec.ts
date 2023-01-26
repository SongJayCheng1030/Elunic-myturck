import { Test, TestingModule } from '@nestjs/testing';

import { SharedConfigService } from './shared-config.service';

describe('SharedConfigService', () => {
  let service: SharedConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedConfigService],
    }).compile();

    service = module.get<SharedConfigService>(SharedConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
