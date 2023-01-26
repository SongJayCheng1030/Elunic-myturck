import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OeeMonitoringOverviewComponent } from './oee-monitoring-overview.component';

describe('OeeMonitoringOverviewComponent', () => {
  let component: OeeMonitoringOverviewComponent;
  let fixture: ComponentFixture<OeeMonitoringOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OeeMonitoringOverviewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OeeMonitoringOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
