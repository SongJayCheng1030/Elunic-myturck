import { TestBed } from '@angular/core/testing';

import { GrafanaBuildingSetService } from './grafana-building-set.service';

describe('GrafanaBuildingSetService', () => {
  let service: GrafanaBuildingSetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrafanaBuildingSetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
