import { TestBed } from '@angular/core/testing';

import { TimebrokerService } from './timebroker.service';

describe('TimebrokerService', () => {
  let service: TimebrokerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimebrokerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
