import { TestBed } from '@angular/core/testing';

import { SharedHubService } from './shared-hub.service';

describe('SharedHubService', () => {
  let service: SharedHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedHubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
