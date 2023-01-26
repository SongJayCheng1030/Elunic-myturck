import { Test, TestingModule } from '@nestjs/testing';

import { SharedApiService } from './shared-api.service';

describe('SharedApiService', () => {
  let service: SharedApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedApiService],
    }).compile();

    service = module.get<SharedApiService>(SharedApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
