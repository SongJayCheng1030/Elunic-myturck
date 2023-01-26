import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrafanaBuildingSetComponent } from './grafana-building-set.component';

describe('GrafanaBuildingSetComponent', () => {
  let component: GrafanaBuildingSetComponent;
  let fixture: ComponentFixture<GrafanaBuildingSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GrafanaBuildingSetComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GrafanaBuildingSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
