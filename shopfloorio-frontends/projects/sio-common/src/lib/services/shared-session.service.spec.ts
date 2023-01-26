import { TestBed } from '@angular/core/testing';

import { SharedSessionService } from './shared-session.service';

describe('SharedSessionService', () => {
  let service: SharedSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
