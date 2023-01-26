import { TestBed } from '@angular/core/testing';

import { GeneralConfigurationService } from './general-configuration.service';

describe('GeneralConfigurationService', () => {
  let service: GeneralConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneralConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
