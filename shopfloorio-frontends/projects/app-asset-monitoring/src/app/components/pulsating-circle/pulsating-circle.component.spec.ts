import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PulsatingCircleComponent } from './pulsating-circle.component';

describe('PulsatingCircleComponent', () => {
  let component: PulsatingCircleComponent;
  let fixture: ComponentFixture<PulsatingCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PulsatingCircleComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PulsatingCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
