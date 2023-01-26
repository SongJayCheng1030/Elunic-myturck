import { TestBed } from '@angular/core/testing';

import { SharedConditionMonitoringService } from './shared-cm.service';

describe('SharedConditionMonitoringService', () => {
  let service: SharedConditionMonitoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedConditionMonitoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
