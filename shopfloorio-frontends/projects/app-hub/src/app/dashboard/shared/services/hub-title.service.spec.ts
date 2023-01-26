import { TestBed } from '@angular/core/testing';

import { HubTitleService } from './hub-title.service';

describe('HubTitleService', () => {
  let service: HubTitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HubTitleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
