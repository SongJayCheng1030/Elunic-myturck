import { TestBed } from '@angular/core/testing';

import { LocalSessionStorageService } from './local-session-storage.service';

describe('LocalSessionStorageService', () => {
  let service: LocalSessionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalSessionStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
