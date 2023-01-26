import { TestBed } from '@angular/core/testing';

import { RightGuard } from './right-guard.guard';

describe('RightGuard', () => {
  let guard: RightGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RightGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
