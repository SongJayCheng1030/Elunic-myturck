import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrafanaBuildingSetAssetComponent } from './grafana-building-set-asset.component';

describe('GrafanaBuildingSetAssetComponent', () => {
  let component: GrafanaBuildingSetAssetComponent;
  let fixture: ComponentFixture<GrafanaBuildingSetAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GrafanaBuildingSetAssetComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GrafanaBuildingSetAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
