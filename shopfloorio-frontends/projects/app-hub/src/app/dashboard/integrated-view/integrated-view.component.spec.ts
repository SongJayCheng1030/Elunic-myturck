import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegratedViewComponent } from './integrated-view.component';

describe('IntegratedViewComponent', () => {
  let component: IntegratedViewComponent;
  let fixture: ComponentFixture<IntegratedViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IntegratedViewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegratedViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
