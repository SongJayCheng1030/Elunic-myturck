import { TestBed } from '@angular/core/testing';

import { SharedUserService } from './shared-user.service';

describe('SharedUserService', () => {
  let service: SharedUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
