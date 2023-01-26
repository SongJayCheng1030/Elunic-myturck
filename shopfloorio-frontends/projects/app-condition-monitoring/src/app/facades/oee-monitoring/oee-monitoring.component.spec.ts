import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OeeMonitoringComponent } from './oee-monitoring.component';

describe('OeeMonitoringComponent', () => {
  let component: OeeMonitoringComponent;
  let fixture: ComponentFixture<OeeMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OeeMonitoringComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OeeMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
