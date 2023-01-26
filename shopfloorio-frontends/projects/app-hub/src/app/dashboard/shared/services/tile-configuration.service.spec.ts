import { TestBed } from '@angular/core/testing';

import { TileConfigurationService } from './tile-configuration.service';

describe('TileConfigurationService', () => {
  let service: TileConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TileConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
