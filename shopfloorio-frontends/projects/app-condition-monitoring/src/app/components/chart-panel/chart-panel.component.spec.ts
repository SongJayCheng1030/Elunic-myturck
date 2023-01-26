import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartPanelComponent } from './chart-panel.component';

describe('ChartPanelComponent', () => {
  let component: ChartPanelComponent;
  let fixture: ComponentFixture<ChartPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChartPanelComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
