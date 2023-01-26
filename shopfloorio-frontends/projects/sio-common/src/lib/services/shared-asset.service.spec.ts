import { TestBed } from '@angular/core/testing';

import { SharedAssetService } from './shared-asset.service';

describe('SharedAssetService', () => {
  let service: SharedAssetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedAssetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
