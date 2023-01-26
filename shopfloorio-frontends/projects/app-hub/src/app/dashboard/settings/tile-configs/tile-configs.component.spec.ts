import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileConfigsComponent } from './tile-configs.component';

describe('TileConfigsComponent', () => {
  let component: TileConfigsComponent;
  let fixture: ComponentFixture<TileConfigsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TileConfigsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TileConfigsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
