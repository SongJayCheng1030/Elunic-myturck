import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrafanaBuildingSetAdminComponent } from './grafana-building-set-admin.component';

describe('GrafanaBuildingSetAssetComponent', () => {
  let component: GrafanaBuildingSetAdminComponent;
  let fixture: ComponentFixture<GrafanaBuildingSetAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GrafanaBuildingSetAdminComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GrafanaBuildingSetAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
